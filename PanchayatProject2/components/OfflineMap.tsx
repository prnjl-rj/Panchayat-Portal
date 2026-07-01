import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Search, 
  WifiOff, 
  Layers, 
  ArrowLeft, 
  MoveRight,
  Map as MapIcon,
  Maximize2
} from "lucide-react";
import { Society } from "../types";

interface OfflineMapProps {
  selectedSociety: Society | null;
  isOpen: boolean;
  onClose: () => void;
}

// Fixed mock locations around the selected society to emulate "stuck offline in the city"
interface Landmark {
  name: string;
  distance: string;
  timeWalking: string;
  latOffset: number; // offset relative to society center
  lngOffset: number;
  directions: string[];
}

export default function OfflineMap({ selectedSociety, isOpen, onClose }: OfflineMapProps) {
  const [selectedLandmarkIdx, setSelectedLandmarkIdx] = useState<number>(0);
  const [isRouting, setIsRouting] = useState<boolean>(true);
  const [compassHeading, setCompassHeading] = useState<number>(45);
  const [simulatedGpsAccuracy, setSimulatedGpsAccuracy] = useState<number>(18);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  // Customize mock landmarks based on selected society's city
  const isBengaluru = selectedSociety?.city.toLowerCase().includes("bengaluru") || false;
  const isMumbai = selectedSociety?.city.toLowerCase().includes("mumbai") || false;

  const landmarks: Landmark[] = isBengaluru ? [
    {
      name: "Bannerghatta National Park Crossing",
      distance: "2.4 km",
      timeWalking: "28 mins",
      latOffset: 0.015,
      lngOffset: -0.012,
      directions: [
        "Head North-East on Bannerghatta Rd towards Arekere (800m)",
        "At the Shell Petrol Pump intersection, turn Right onto Lake Link Rd (600m)",
        "Pass by Nilgiris Departmental Store on your left",
        "Turn Left onto Skyline Vista Entry Lane (300m)",
        "Skyline Vista Towers Main gate will be directly straight ahead"
      ]
    },
    {
      name: "Gottigere Metro Station Junction",
      distance: "1.1 km",
      timeWalking: "13 mins",
      latOffset: -0.008,
      lngOffset: 0.007,
      directions: [
        "Exit Metro Station Gate A and head South on main road (300m)",
        "Take a Sharp Left at the corner bakery onto Layout Arterial Rd (500m)",
        "Cross the small pedestrian stone bridge",
        "At the signal, turn Right. Skyline Vista Towers is 200m ahead on your Right"
      ]
    },
    {
      name: "Meenakshi Mall Main Parking",
      distance: "3.7 km",
      timeWalking: "45 mins",
      latOffset: 0.022,
      lngOffset: 0.018,
      directions: [
        "Head West from Mall exit towards hulimavu signal (1.2 km)",
        "Turn Left at the signal intersection onto Bannerghatta Main Road (1.5 km)",
        "Turn Left again immediately past the Royal Enclave Archway (700m)",
        "Proceed past security outpost 1 straight to Skyline Vista Entrance"
      ]
    }
  ] : isMumbai ? [
    {
      name: "Versova Metro Station Arch",
      distance: "1.5 km",
      timeWalking: "18 mins",
      latOffset: -0.011,
      lngOffset: -0.009,
      directions: [
        "Walk East along JP Road past the Versova Post Office (400m)",
        "At Seven Bungalows circle, turn Left onto Lokhandwala Link Road (800m)",
        "Turn Right immediately after the ICICI Bank corner (200m)",
        "Silver Oak Residency Gate is next to the primary health center"
      ]
    },
    {
      name: "Andheri Sports Complex Gate 3",
      distance: "2.1 km",
      timeWalking: "25 mins",
      latOffset: 0.014,
      lngOffset: 0.008,
      directions: [
        "Walk South towards Veera Desai Road (600m)",
        "At the intersection, turn Left onto Lokhandwala Link Road (1.0 km)",
        "Pass the Silver Spoon restaurant strip on your left",
        "Silver Oak Residency Gate will be on your left side"
      ]
    },
    {
      name: "Lokhandwala Market Market Square",
      distance: "0.8 km",
      timeWalking: "9 mins",
      latOffset: -0.005,
      lngOffset: 0.004,
      directions: [
        "Walk South-West through the central shopping alley (300m)",
        "At the main crossing, proceed straight past Mocha Coffee house (300m)",
        "Enter Silver Oak Residency lane via the private resident walkway"
      ]
    }
  ] : [
    // Gurgaon Greenwood defaults
    {
      name: "Sector 14 Central Market Plaza",
      distance: "1.2 km",
      timeWalking: "14 mins",
      latOffset: 0.008,
      lngOffset: -0.011,
      directions: [
        "Exit Market Plaza north-east gate towards Community Center (300m)",
        "Turn Right near HDFC Bank corner onto Sector 14 Main Road (500m)",
        "Follow road past the primary school roundabout (200m)",
        "Turn Left onto Greenwood Heights Society avenue. Gate 2 is 150m ahead."
      ]
    },
    {
      name: "IFFCO Chowk Metro Station Gate B",
      distance: "3.5 km",
      timeWalking: "42 mins",
      latOffset: 0.024,
      lngOffset: 0.015,
      directions: [
        "Head South on IFFCO Chowk exit link road (800m)",
        "Keep Left to merge onto Service Road towards Sector 14 Expressway transition (1.2 km)",
        "Turn Right under the Sector 14 Overpass (900m)",
        "Take immediate Right into Greenwood Heights Enclave Gateway."
      ]
    },
    {
      name: "Highway Flyover Exit Roundabout",
      distance: "2.0 km",
      timeWalking: "24 mins",
      latOffset: -0.016,
      lngOffset: 0.010,
      directions: [
        "Take 2nd Exit off Roundabout onto Royal Greens boulevard (800m)",
        "Turn Left past the Indian Oil Petrol station (600m)",
        "Take 1st Right onto Sector 14 inner residential link (400m)",
        "Greenwood Heights Security main gate is visible directly straight."
      ]
    }
  ];

  const currentLandmark = landmarks[selectedLandmarkIdx] || landmarks[0];

  // Slowly fluctuate compass heading & accuracy to emulate live offline magnetic compass sensors
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCompassHeading(prev => (prev + (Math.random() * 6 - 3) + 360) % 360);
      setSimulatedGpsAccuracy(prev => Math.max(12, Math.min(25, prev + (Math.random() * 4 - 2))));
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Render completely offline SVG/Canvas Vector Map
  // Center is always (150, 150) in SVG coordinate map space representing Society Center
  const mapCenterProps = { x: 170, y: 170 };
  const landmarkOffsetMultiplier = 3500; // pixels per degree offset
  const landmarkX = mapCenterProps.x + currentLandmark.lngOffset * landmarkOffsetMultiplier;
  const landmarkY = mapCenterProps.y - currentLandmark.latOffset * landmarkOffsetMultiplier; // Screen Y goes down

  return (
    <div className="absolute inset-0 bg-[#f9fafb] z-50 flex flex-col overflow-hidden">
      
      {/* Offline Status Header */}
      <div className="bg-neutral-900 text-white px-5 pt-10 pb-4 flex items-center justify-between shrink-0 shadow-lg relative">
        <button 
          onClick={onClose}
          className="p-1 px-2.5 text-xs font-bold bg-neutral-800 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back Home
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[9.5px] uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-1.5 font-mono">
            <WifiOff className="w-3.5 h-3.5 animate-bounce" /> Local Offline Map
          </span>
          <span className="text-xs text-neutral-400 font-medium truncate max-w-[140px]">{selectedSociety?.name || "My Society Portal"}</span>
        </div>

        <div className="flex items-center gap-1 font-mono text-[9.5px] bg-red-950/80 border border-red-500/30 text-rose-300 px-2 py-0.5 rounded-full font-bold">
          No Internet
        </div>
      </div>

      {/* Primary Map Stage and SVG Rendering Mock Caching Tile Grid */}
      <div className="flex-1 bg-[#eae8e4] relative overflow-hidden flex flex-col">
        {/* Mock GPS Sensor Bar */}
        <div className="absolute top-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-2.5 border border-neutral-300/60 shadow-md z-30 flex items-center justify-between text-[11px] text-neutral-700">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-emerald animate-spin-slow" style={{ transform: `rotate(${compassHeading}deg)` }} />
            <span className="font-semibold">Heading: {Math.round(compassHeading)}° NE</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GPS Cache Accuracy: ±{simulatedGpsAccuracy.toFixed(1)}m</span>
          </div>
        </div>

        {/* Live Vector Local Canvas (Rendering simulated map geometry) */}
        <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
          
          {/* Tile Grid line decorations */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.22] bg-[radial-gradient(#a3a3a3_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* SVG Canvas Map Display representing custom cached city coordinates */}
          <svg className="w-full h-full absolute inset-0 select-none" viewBox="0 0 340 340">
            {/* Compass Range Grid Rings */}
            <circle cx="170" cy="170" r="130" fill="none" stroke="#d4d4d4" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx="170" cy="170" r="70" fill="none" stroke="#d4d4d4" strokeWidth="1" strokeDasharray="4,4" />

            {/* Simulated Sector Roads & Arteries */}
            {/* Main Expressway Road */}
            <path d="M -10,120 L 350,120" stroke="#fcfcfc" strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M -10,120 L 350,120" stroke="#a3a3a3" strokeWidth="1" fill="none" strokeDasharray="3,3" />

            {/* City Link Road */}
            <path d="M 120,-10 L 120,350" stroke="#fcfcfc" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 120,-10 L 120,350" stroke="#a3a3a3" strokeWidth="1" fill="none" strokeDasharray="3,3" />

            {/* Sector Walkways */}
            <path d="M -10,174 L 170,174 L 170,350" stroke="#fff" strokeWidth="8" fill="none" />
            <path d="M 170,170 L 350,220" stroke="#fff" strokeWidth="8" fill="none" />

            {/* Sector Parks & Lakes in City */}
            <rect x="20" y="30" width="80" height="60" rx="10" fill="#cbdcc4" stroke="#abc0a2" strokeWidth="1.5" />
            <text x="60" y="65" fontSize="8" fill="#5c7a4e" textAnchor="middle" className="font-sans font-semibold">Sector Green park</text>

            <circle cx="280" cy="60" r="24" fill="#bbdefb" stroke="#90caf9" strokeWidth="1.5" />
            <text x="280" y="63" fontSize="8" fill="#1565c0" textAnchor="middle" className="font-sans font-semibold">City Water body</text>

            <rect x="220" y="250" width="80" height="50" rx="8" fill="#e2e1dd" stroke="#cccccc" strokeWidth="1.5" />
            <text x="260" y="278" fontSize="8" fill="#666666" textAnchor="middle" className="font-sans font-semibold">Commercial Hub</text>

            {/* BLINKING LOCAL CACHED VECTOR ROUTE LINE */}
            {isRouting && (
              <path 
                d={`M ${landmarkX},${landmarkY} L ${mapCenterProps.x},${mapCenterProps.y}`} 
                stroke="#10b981" 
                strokeWidth="4" 
                fill="none" 
                strokeLinecap="round"
                className="animate-pulse"
                strokeDasharray="8,4"
              />
            )}

            {/* Greenwood Heights / Selected Society Landmark Point (Always Center Node) */}
            <g transform={`translate(${mapCenterProps.x}, ${mapCenterProps.y})`}>
              <circle cx="0" cy="0" r="16" fill="#065f46" stroke="#ffffff" strokeWidth="2.5" className="animate-pulse" />
              <circle cx="0" cy="0" r="6" fill="#f59e0b" />
              <g transform="translate(0, -22)">
                <rect x="-45" y="-12" width="90" height="15" rx="4" fill="#065f46" />
                <path d="M -5 3 L 0 6 L 5 3 Z" fill="#065f46" />
                <text x="0" y="-2" fill="#ffffff" fontWeight="extrabold" fontSize="6.5" textAnchor="middle" className="font-sans uppercase">
                  HOME: {selectedSociety?.name.split(" ")[0] || "PORTAL"}
                </text>
              </g>
            </g>

            {/* LOST CURRENT POSITION - Stuck point */}
            <g transform={`translate(${landmarkX}, ${landmarkY})`}>
              <circle cx="0" cy="0" r="14" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
              <path d="M-4,-4 L4,4 M4,-4 L-4,4" stroke="#ffffff" strokeWidth="2" />
              <g transform="translate(0, 20)">
                <rect x="-55" y="-12" width="110" height="15" rx="4" fill="#dc2626" />
                <path d="M -5 -15 L 0 -12 L 5 -15 Z" fill="#dc2626" />
                <text x="0" y="-2" fill="#ffffff" fontWeight="bold" fontSize="6.5" textAnchor="middle" className="font-sans">
                  STUCK: YOU ARE HERE
                </text>
              </g>
            </g>
          </svg>

          {/* Compass Rose icon marker */}
          <div className="absolute right-4 bottom-4 bg-white p-2.5 rounded-full border border-neutral-300 shadow-md z-20 flex items-center justify-center">
            <Compass className="w-5 h-5 text-neutral-800" />
          </div>

          <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-300 shadow-sm z-20 text-[9.5px] text-neutral-600 font-mono">
            Lat: {selectedSociety?.city.includes("Bengaluru") ? "12.9716" : "28.4595"}N <br />
            Lng: {selectedSociety?.city.includes("Bengaluru") ? "77.5946" : "77.0266"}E
          </div>
        </div>
      </div>

      {/* Landmark Selecetor and Turn-by-turn Navigation instructions */}
      <div className="bg-white border-t border-neutral-200 p-4 shrink-0 flex flex-col max-h-[42%] text-left overflow-y-auto">
        <label className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
          Select Your Stuck Location (Offline Cache):
        </label>
        
        {/* Landmarks Horizontal slide bar */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-2 shrink-0">
          {landmarks.map((l, index) => (
            <button
              key={index}
              onClick={() => setSelectedLandmarkIdx(index)}
              className={`p-2.5 px-3 rounded-xl border text-xs font-semibold shrink-0 transition-all text-left flex flex-col justify-between ${
                selectedLandmarkIdx === index 
                  ? "bg-brand-emerald text-white border-brand-emerald shadow-sm scale-102"
                  : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <span className="font-bold max-w-[140px] truncate">{l.name}</span>
              <div className={`flex items-center gap-2 mt-1.5 text-[9.5px] font-mono ${
                selectedLandmarkIdx === index ? "text-amber-200" : "text-neutral-500"
              }`}>
                <span>📏 {l.distance}</span>
                <span>🚶 {l.timeWalking}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Guidelines Path */}
        <div className="border-t border-neutral-100 pt-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-neutral-800 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-brand-emerald" />
              Cached Steps To {selectedSociety?.name.split(" ")[0] || "Society"}:
            </h4>
            <span className="text-[10px] bg-emerald-50 text-brand-emerald px-2 py-0.5 rounded font-mono font-bold">
              EST. {currentLandmark.timeWalking} Walking
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-neutral-600 flex-1 overflow-y-auto pr-1">
            {currentLandmark.directions.map((step, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="w-4 h-4 bg-neutral-100 border border-neutral-200 rounded-full text-[9px] font-bold flex items-center justify-center text-neutral-600 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-snug">{step}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-amber-50 rounded-xl p-2 border border-amber-200/40 text-[9.5px] text-amber-900 flex items-center gap-2 mt-3 p-2.5 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="leading-normal">
              <strong>Offline Caching Compass Note:</strong> This mapping database was loaded and stored on your device during your last telemetry access. Use physical milestones if GPS signal fluctuates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
