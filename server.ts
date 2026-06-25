import express from "express";
type Request = express.Request;
type Response = express.Response;
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Imports from shared data module
import {
  SOCIETY_NAME,
  SOCIETY_ADDRESS,
  INITIAL_ANNOUNCEMENTS,
  SERVICE_STAFF_DIRECTORY,
  INITIAL_VISITORS,
  RULEBOOK_TEXT,
  SOCIETY_RULES
} from "./src/data";

import { Complaint, ServiceStaff, ServiceRequest, Notification, VisitorRecord, Transaction, Society, SocietyRule, Announcement, ResidentRegistry, AppUser, SosAlert } from "./src/types";

const app = express();
const PORT = 3000;

// Set up bodies with limits for audio base64 uploads
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// --- Welcome Email Simulation System ---
interface WelcomeEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  name: string;
  role: string;
  societyName: string;
}

let welcomeEmails: WelcomeEmail[] = [];

function sendWelcomeEmail(email: string, name: string, role: string, societyName: string) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name || "Community Member";
  
  const subject = `Welcome to the Panchayat Family, ${cleanName}!`;
  const body = `Dear ${cleanName},

On behalf of the entire Panchayat Team, we are absolutely thrilled to welcome you to your new digital home at ${societyName}!

Panchayat was built with a simple, human-centric vision: to weave technology seamlessly into the fabric of your community life, making security, facilities, and neighborly connection convenient, comfortable, and warm.

Please rest assured that we will take care of all your requirements. Whether it is tracking safety updates, resolving household complaints, communicating with gatekeepers, or booking handymen, our team is working around the clock to ensure you have a seamless, worry-free experience.

We wish you the absolute best for your journey and a wonderful future in your community with Panchayat!

With warm regards and respect,

The Panchayat Team
"Your Community, Connected."`;

  // Log to server console
  console.log("\n========================================================");
  console.log(`[PANCHAYAT MAIL SERVER] Sending Welcome Email to: ${cleanEmail}`);
  console.log(`Subject: ${subject}`);
  console.log("--------------------------------------------------------");
  console.log(body);
  console.log("========================================================\n");

  const newEmail: WelcomeEmail = {
    id: `email-${Math.random().toString(36).substring(2, 11)}`,
    to: cleanEmail,
    subject,
    body,
    sentAt: new Date().toISOString(),
    name: cleanName,
    role,
    societyName
  };

  // Prevent multiple identical welcomes during testing
  const alreadySent = welcomeEmails.some(e => e.to === cleanEmail);
  if (!alreadySent) {
    welcomeEmails.unshift(newEmail);
  }
}

// Endpoint to fetch simulated welcome emails
app.get("/api/welcome-emails", (req: Request, res: Response) => {
  res.json(welcomeEmails);
});

// --- Stateful Multi-Tenant Housing Societies ---
let registeredSocieties: Society[] = [
  {
    id: "def-greenwood",
    name: "Greenwood Heights Society",
    address: "Sector 14, Royal Greens Enclave",
    city: "Gurgaon, Haryana",
    adminName: "Mr. Raj Kumar (General Secretary)",
    adminPhone: "+91 98765 00001",
    unitsCount: 450,
    registeredAt: new Date().toISOString(),
    rulesText: RULEBOOK_TEXT,
    rules: SOCIETY_RULES,
    adminEmail: "admin@greenwood.com",
    adminPassword: "admin",
    amenities: [
      { name: "Gymnasium", timing: "6:00 AM to 9:00 PM" },
      { name: "Swimming Pool", timing: "7:00 AM to 11:00 AM, 4:00 PM to 8:00 PM" },
      { name: "Clubhouse Lounge", timing: "9:00 AM to 10:00 PM" }
    ]
  },
  {
    id: "skyline-vista",
    name: "Skyline Vista Towers",
    address: "Bannerghatta Main Road",
    city: "Bengaluru, Karnataka",
    adminName: "Mrs. Anjali Hegde (President)",
    adminPhone: "+91 80880 12345",
    unitsCount: 280,
    registeredAt: new Date().toISOString(),
    rulesText: `Skyline Vista Towers Housing Association Rules\n\n1. AMENITY HOURS & GYM\nOpen daily from 5:30 AM to 9:30 PM. Gym memberships verified via card scan.\n\n2. PARKING REGULATIONS\nAll flat-registered cars must display RFID tags. Unregistered visitor cars must register at Front Gate.\n\n3. NOISE HOUR RULES\nQuiet hours enforced strictly 10:00 PM to 6:30 AM daily. Any high civil drills or renovations must happen only Monday to Friday 10 AM to 5 PM. No drill noise allowed on Weekends.\n\n4. PETS SAFETY POLICY\nPets must wear harnesses in elevators. Scooping poop instantly is the duty of the owner. A fine of ₹1,500 will apply upon violation.`,
    rules: [
      { category: "Gym", title: "Clubhouse Gym Timings", detail: "Open daily from 5:30 AM to 9:30 PM. Proper training footwear is compulsory. No access without active RFID cards." },
      { category: "Parking", title: "RFID Entry Tags Only", detail: "Automated boom gate checks for RFID tags. Visitors park in Ground level visitors grid. Free for first 3 hours." },
      { category: "Renovations", title: "Drill Quiet Hours", detail: "Allowed Monday to Friday 10 AM - 5 PM. Drilling is strictly prohibited on Saturdays, Sundays, and major holidays." },
      { category: "Pets", title: "Poop scooping duty", detail: "Leash required. Immediate cleaning of pet waste in green waste bags. ₹1,500 penalty for lift littering." }
    ],
    adminEmail: "admin@skyline.com",
    adminPassword: "admin",
    amenities: [
      { name: "Gymnasium", timing: "5:30 AM to 9:30 PM" },
      { name: "Children's Play Area", timing: "8:00 AM to 8:00 PM" }
    ]
  },
  {
    id: "silver-oak",
    name: "Silver Oak Residency",
    address: "Lokhandwala Complex, Andheri West",
    city: "Mumbai, Maharashtra",
    adminName: "Mr. Vikram Mehta (Chairman)",
    adminPhone: "+91 91234 56789",
    unitsCount: 160,
    registeredAt: new Date().toISOString(),
    rulesText: `Silver Oak Residency Housing Rules\n\n1. CONGESTION & SPEED LIMIT\nEach flat allotted 1 closed ground-floor parking space. Speed limit set to 8 km/h. No visual layout obstructions allowed.\n\n2. WASTE & HYGIENE POLICY\nWet (Green bin) and Dry Recyclables (Blue bin) doors collected daily 9:00 AM - 10:45 AM. Non-segregated rubbish skips collection as per Municipal bylaws.`,
    rules: [
      { category: "Parking", title: "Car Slots & Speed Limits", detail: "Strict speed limit of 8 km/h inside premises. Park exclusively in your allocated sticker bay." },
      { category: "Refuse", title: "Wet & Dry Waste Collection", detail: "Collection scheduled between 9:00 AM and 10:45 AM. Segregation is strictly compulsory." }
    ],
    adminEmail: "admin@silveroak.com",
    adminPassword: "admin",
    amenities: [
      { name: "Gymnasium", timing: "6:00 AM to 10:00 PM" },
      { name: "Multipurpose Hall", timing: "9:00 AM to 11:00 PM" }
    ]
  }
];

// Helper to resolve society ID from headers or query params
function getSocietyId(req: Request): string {
  const headerId = req.headers['x-society-id'] || req.headers['X-Society-Id'];
  if (headerId && typeof headerId === "string" && headerId !== "null") return headerId;
  const queryId = req.query.societyId;
  if (queryId && typeof queryId === "string" && queryId !== "null") return queryId;
  return "def-greenwood";
}

// Map that holds specific service staff roster per society to keep them customized!
let societyStaffMap: { [societyId: string]: ServiceStaff[] } = {
  "def-greenwood": [...SERVICE_STAFF_DIRECTORY],
  "skyline-vista": SERVICE_STAFF_DIRECTORY.map(s => s.id === "st-1" ? { ...s, name: "Kiran R.", phone: "+91 98321 44556", avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop" } : s),
  "silver-oak": SERVICE_STAFF_DIRECTORY.map(s => s.id === "st-3" ? { ...s, name: "Abhishek S.", phone: "+91 71002 99112", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" } : s),
};

// --- Stateful In-Memory Multi-tenant Collections (seeded for Greenwood by default) ---
let complaints: (Complaint & { societyId: string })[] = [
  {
    id: "comp-1",
    societyId: "def-greenwood",
    residentName: "Aarav Mehta",
    flatNumber: "Tower A - 302",
    text: "The main water pipe in our master bathroom is leaking, creating small puddles. Please send a plumber quickly to take a look.",
    summary: "Master bathroom pipe leaking",
    category: "Plumbing",
    severity: "High",
    status: "In Progress",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
  },
  {
    id: "comp-2",
    societyId: "def-greenwood",
    residentName: "Sneha Reddy",
    flatNumber: "Tower C - 1105",
    text: "Fluorescent lights on the 11th floor lobby are continuously flickering and creating a buzzing sound. Please get them replaced.",
    summary: "11th floor lobby lights buzzing & flickering",
    category: "Electrical",
    severity: "Low",
    status: "Pending",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
  },
  // Add some realistic seed complaints for Skyline Vista
  {
    id: "comp-vista-1",
    societyId: "skyline-vista",
    residentName: "Rohan Das",
    flatNumber: "Block D - 404",
    text: "Internet fiber cable is cut on the 4th floor ductway. Please send the local structural technician on-duty.",
    summary: "Floor duct fiber cut",
    category: "Electrical",
    severity: "Medium",
    status: "Pending",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

let serviceRequests: (ServiceRequest & { societyId: string })[] = [
  {
    id: "req-1",
    societyId: "def-greenwood",
    staffId: "st-5",
    staffName: "QuickDry Laundry",
    category: "Laundry",
    flatNumber: "Tower B - 802",
    timeSlot: "Today, 4:00 PM - 6:00 PM",
    status: "Completed",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    paymentStatus: "Paid",
    amount: 160,
    transactionId: "TXN583294821"
  }
];

let transactions: (Transaction & { societyId: string })[] = [
  {
    id: "tx-1",
    societyId: "def-greenwood",
    requestId: "req-1",
    staffName: "QuickDry Laundry",
    category: "Laundry",
    amount: 160,
    paymentMethod: "UPI",
    status: "Success",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    transactionId: "TXN583294821"
  }
];

let notifications: (Notification & { societyId: string })[] = [
  {
    id: "not-1",
    societyId: "def-greenwood",
    title: "Complaint Status Update",
    message: "Your complaint about 'Master bathroom pipe leaking' has been updated to 'In Progress'.",
    type: "complaint",
    isRead: false,
    timestamp: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
  },
  {
    id: "not-2",
    societyId: "def-greenwood",
    title: "New Announcement",
    message: "Urgent: Water Tank Cleaning Scheduled for Phase 1.",
    type: "announcement",
    isRead: false,
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
  },
  {
    id: "not-3",
    societyId: "def-greenwood",
    title: "Visitor Waiting",
    message: "Amit Mishra (Zomato Food Delivery) is waiting at the main gate.",
    type: "visitor",
    isRead: false,
    timestamp: new Date().toISOString()
  },
  {
    id: "not-vista-1",
    societyId: "skyline-vista",
    title: "Gate Notification",
    message: "Urban Company staff registered at gate for Block D 404.",
    type: "visitor",
    isRead: false,
    timestamp: new Date().toISOString()
  }
];

let visitorLogs: (VisitorRecord & { societyId: string })[] = [
  ...INITIAL_VISITORS.map(v => ({ ...v, societyId: "def-greenwood" })),
  {
    id: "vis-vista-1",
    societyId: "skyline-vista",
    visitorName: "Subhash (Amazon)",
    purpose: "Parcel Box",
    flatNumber: "Block A - 202",
    entryTime: "12:15",
    status: "Approved"
  }
];

let appAnnouncements: (Announcement & { societyId: string })[] = [
  ...INITIAL_ANNOUNCEMENTS.map(a => ({ ...a, societyId: "def-greenwood" })),
  {
    id: "ann-vista-1",
    societyId: "skyline-vista",
    title: "Welcome to Skyline Vista Association",
    content: "Greetings to all residents of Skyline Vista Towers! Enjoy our all-new Panchayat Digital Resident Board, allowing you to instantly book service technicians, report gate visitors, and file grievances.",
    sender: "Elected Board of Skyline",
    date: new Date().toISOString(),
    priority: "High"
  }
];

import { ChatMessage } from "./src/types";

let chatMessages: (ChatMessage & { societyId: string })[] = [];

// In-Memory Database of registered residents with the societies (To verify from database!)
let preRegisteredResidents: ResidentRegistry[] = [

  { societyId: "def-greenwood", name: "Rohan Khanna", flatNumber: "Tower B - 1204", phone: "+91 98765 12345", email: "rohan@gmail.com", password: "123" },
  { societyId: "def-greenwood", name: "Anjali Mehta", flatNumber: "Tower A - 601", phone: "+91 88877 99911", email: "anjali@gmail.com", password: "123" },
  { societyId: "def-greenwood", name: "Vikram Sen", flatNumber: "Tower C - 402", phone: "+91 99900 11122", email: "vikram@gmail.com", password: "123" },
  { societyId: "def-greenwood", name: "Pranjal Raj", flatNumber: "Tower D - 101", phone: "+91 98765 00002", email: "prnjlrj.work@gmail.com", password: "123" },
  { societyId: "def-greenwood", name: "Arun Kumar", flatNumber: "Tower A - 302", phone: "+91 91234 56780", email: "arun@gmail.com", password: "123" },
  // Skyline Vista
  { societyId: "skyline-vista", name: "Kiran Rao", flatNumber: "Tower X - 505", phone: "+91 70123 45678", email: "kiran@gmail.com", password: "123" },
  { societyId: "skyline-vista", name: "Deepika Padukone", flatNumber: "Tower Y - 1201", phone: "+91 80112 33445", email: "deepika@gmail.com", password: "123" },
  // Silver Oak
  { societyId: "silver-oak", name: "Sachin Tendulkar", flatNumber: "Villa 10", phone: "+91 91000 99999", email: "sachin@gmail.com", password: "123" }
];

// Active sessions/Users logged into the application
let appUsers: AppUser[] = [
  {
    id: "session-root",
    societyId: "def-greenwood",
    name: "Rohan Khanna",
    flatNumber: "Tower B - 1204",
    email: "rohan@gmail.com",
    phone: "+91 98765 12345",
    isRegisteredResident: true,
    subscriptionType: "Free",
    subscriptionExpiresAt: new Date(Date.now() + 3600000 * 24 * 7).toISOString(), // 1 week free option
    createdAt: new Date().toISOString()
  }
];

// Active SOS Alerts
let sosAlerts: SosAlert[] = [
  {
    id: "sos-init",
    societyId: "def-greenwood",
    residentName: "Anjali Mehta",
    flatNumber: "Tower A - 601",
    phone: "+91 88877 99911",
    locationDetails: "stuck near Central Courtyard Entrance",
    latitude: 28.4595,
    longitude: 77.0266,
    timestamp: new Date().toISOString(),
    status: "Active"
  }
];

// --- Helper: Lazy get Gemini Client ---
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });
}

// --- Dynamic Simulation of Service Tickets ---
// Simulates state change updates with local notifications
function dispatchLocalNotification(societyId: string, title: string, message: string, type: 'complaint' | 'service' | 'announcement' | 'visitor') {
  const newNot: Notification & { societyId: string } = {
    id: `not-${Math.random().toString(36).substr(2, 9)}`,
    societyId,
    title,
    message,
    type,
    isRead: false,
    timestamp: new Date().toISOString()
  };
  notifications.unshift(newNot);
}

// Automatically processes ticket status escalation to mimic real-time updates
function simulateRequestProgress(societyId: string, reqId: string, staffName: string) {
  setTimeout(() => {
    const reqIndex = serviceRequests.findIndex(r => r.id === reqId);
    if (reqIndex !== -1 && serviceRequests[reqIndex].status === "Requested") {
      serviceRequests[reqIndex].status = "Assigned";
      dispatchLocalNotification(
        societyId,
        "Service Booking Assigned",
        `Technician ${staffName} has accepted your request. Estimated arrival in 15 mins.`,
        "service"
      );
    }
  }, 10000); // 10 seconds to transition to Assigned

  setTimeout(() => {
    const reqIndex = serviceRequests.findIndex(r => r.id === reqId);
    if (reqIndex !== -1 && serviceRequests[reqIndex].status === "Assigned") {
      serviceRequests[reqIndex].status = "In Progress";
      dispatchLocalNotification(
        societyId,
        "Service In Progress",
        `${staffName} has initiated the work at your property.`,
        "service"
      );
    }
  }, 22000); // 22 seconds to transition to In Progress

  setTimeout(() => {
    const reqIndex = serviceRequests.findIndex(r => r.id === reqId);
    if (reqIndex !== -1 && serviceRequests[reqIndex].status === "In Progress") {
      serviceRequests[reqIndex].status = "Completed";
      dispatchLocalNotification(
        societyId,
        "Service Completed!",
        `${staffName} has successfully completed the requested service. Please leave a rating!`,
        "service"
      );
    }
  }, 35000); // 35 seconds to transition to Completed
}

// --- API ENDPOINTS ---

// GET list of registered societies
app.get("/api/societies", (req: Request, res: Response) => {
  res.json(registeredSocieties);
});

// DELETE a society!
app.delete("/api/societies/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, password } = req.body;

  if (email !== "raj.pranjal.999@gmail.com" || password !== "#Shanvi2507") {
    res.status(401).json({ error: "Unauthorized. Invalid Master Admin credentials." });
    return;
  }

  const index = registeredSocieties.findIndex(s => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Society not found." });
    return;
  }

  const societyName = registeredSocieties[index].name;

  // Remove society
  registeredSocieties.splice(index, 1);

  // Clean up associated residents
  preRegisteredResidents = preRegisteredResidents.filter(r => r.societyId !== id);
  appUsers = appUsers.filter(u => u.societyId !== id);

  res.json({ success: true, message: `Society '${societyName}' has been successfully deleted.` });
});

// POST register a new society!
app.post("/api/societies/register", (req: Request, res: Response) => {
  const { name, address, city, adminName, adminPhone, unitsCount, residents, subscriptionType, adminEmail, adminPassword } = req.body;
  if (!name || !address || !city) {
    res.status(400).json({ error: "Society name, address, and city are required." });
    return;
  }

  const newId = `soc-${Math.random().toString(36).substr(2, 9)}`;
  const cleanUnitsCount = Number(unitsCount) || 120;

  // Initialize sample rules specific to this new society
  const customRulesText = `${name} Cooperative Housing Rules and Regulations\n\n1. TIMINGS & GUIDELINES\nCommon areas and gymnasium facilities are open from 6:00 AM to 9:00 PM. Residents must ensure general cleanliness.\n\n2. PARKING SECURITY\nAll personal vehicles must park in assigned lots. Visitors must be registered in the central gate register.\n\n3. CODE OF LIVING\nQuiet hours should be respected from 10:30 PM to 6:30 AM. No loudspeaker usage is permitted without administrative NOC.`;
  const customSocietyRules: SocietyRule[] = [
    { category: "Gym", title: "General Opening Timings", detail: "Open daily from 6:00 AM to 9:00 PM. Clean indoor athletic wear required." },
    { category: "Parking", title: "Allocated Gates & Bays", detail: "Parking restricted strictly to flat numbers. Speed limit 10 km/h." },
    { category: "Refuse", title: "Daily Garbage Pickup", detail: "Collects at doorsteps daily 8:30 AM to 10:00 AM. Please separate dry/wet bins." },
    { category: "Pets", title: "Harness/Leash requirements", detail: "All pet dogs must remain securely leashed in staircases and lobby spaces." }
  ];

  const newSociety: Society = {
    id: newId,
    name,
    address,
    city,
    adminName: adminName || "Management Committee",
    adminPhone: adminPhone || "+91 99999 11111",
    adminEmail: adminEmail || `admin@${newId}.com`,
    adminPassword: adminPassword || "admin",
    unitsCount: cleanUnitsCount,
    registeredAt: new Date().toISOString(),
    rulesText: customRulesText,
    rules: customSocietyRules,
    subscriptionType: subscriptionType || "Free"
  };

  registeredSocieties.push(newSociety);

  // Add the custom residents database if provided
  if (Array.isArray(residents)) {
    residents.forEach((r: any) => {
      const email = (r.email || "").toLowerCase().trim();
      if (email) {
        // Parse family members - can be comma-separated or array
        let familyMembersArray: string[] = [];
        if (Array.isArray(r.familyMembers)) {
          familyMembersArray = r.familyMembers.filter((item: any) => typeof item === 'string' && item.trim() !== "");
        } else if (typeof r.familyMembers === 'string' && r.familyMembers.trim() !== "") {
          familyMembersArray = r.familyMembers.split(",").map((item: string) => item.trim()).filter((item: string) => item !== "");
        }

        preRegisteredResidents.push({
          societyId: newId,
          name: r.name || "Resident",
          flatNumber: r.flatNumber || "Unit 101",
          email: email,
          phone: r.phone || "+91 99999 88888",
          age: r.age ? Number(r.age) : undefined,
          gender: r.gender || undefined,
          familyMembers: familyMembersArray.length > 0 ? familyMembersArray : undefined
        });
      }
    });
  }

  // Initialize customized service staffs roster for this new society!
  const customNames = ["Amit", "Vikram", "Ganesh", "Rajesh", "Prakash", "Sanjay"];
  const categories: ('Plumber' | 'Laundry' | 'Electrician' | 'Housekeeping' | 'Car Wash' | 'Pest Control')[] = [
    'Plumber', 'Laundry', 'Electrician', 'Housekeeping', 'Car Wash', 'Pest Control'
  ];
  
  const customStaff: ServiceStaff[] = categories.map((cat, index) => {
    const firstName = customNames[index % customNames.length];
    return {
      id: `st-${newId}-${index}`,
      name: `${firstName} Service Pro`,
      category: cat,
      rating: +(4.2 + Math.random() * 0.7).toFixed(1),
      contactName: `${firstName} (${cat})`,
      phone: `+91 ${70000 + Math.floor(Math.random() * 20000)} ${10000 + Math.floor(Math.random() * 80000)}`,
      isAvailable: true,
      avatar: `https://images.unsplash.com/photo-${index === 0 ? "1621905251189-08b45d6a269e" : index === 2 ? "1540569014015-19a7be504e3a" : "1581578731548-c64695cc6952"}?q=80&w=200&auto=format&fit=crop`,
      experienceYears: Math.floor(3 + Math.random() * 8),
      baseCharge: cat === 'Laundry' ? "₹35 / Kg" : `₹${120 + index * 40} / Visit`
    };
  });

  societyStaffMap[newId] = customStaff;

  // Dispatch a warm system-wide announcement for the newly registered society!
  const systemNoticeAnnouncement = {
    id: `ann-${newId}-welcome`,
    societyId: newId,
    title: "Welcome to Our New Portal!",
    content: `Great news! ${name} is officially registered on Panchayat Portal. Residents can now utilize this secure dashboard to register guests, book verify services, check guidelines, and submit maintenance grievances.`,
    sender: adminName || "System Admin",
    date: new Date().toISOString(),
    priority: "High" as const
  };
  appAnnouncements.unshift(systemNoticeAnnouncement);

  // Send a welcome notification
  dispatchLocalNotification(
    newId,
    "Society Portal Activated",
    `Portal activated successfully for ${name}. Share this dashboard link with your gatekeepers & homeowners!`,
    "announcement"
  );

  // Trigger simulated welcome email to society owner/administrator
  if (adminEmail) {
    sendWelcomeEmail(adminEmail, adminName || "Society Administrator", "Society Creator/Caretaker", name);
  }

  res.json({ success: true, society: newSociety });
});

// Update an existing society's data configurations
app.patch("/api/societies/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const idx = registeredSocieties.findIndex(s => s.id === id);
  if (idx !== -1) {
    registeredSocieties[idx] = { ...registeredSocieties[idx], ...updates };
    res.json(registeredSocieties[idx]);
  } else {
    res.status(404).json({ error: "Society not found" });
  }
});

// Metadata diagnostic and credentials check
app.get("/api/health", (req: Request, res: Response) => {
  const hasGemini = !!getGeminiClient();
  const societyId = getSocietyId(req);
  const activeSoc = registeredSocieties.find(s => s.id === societyId) || registeredSocieties[0];
  res.json({
    status: "ok",
    hasGeminiKey: hasGemini,
    society: activeSoc.name,
    societyId: activeSoc.id,
    timestamp: new Date().toISOString()
  });
});

// GET all society notifications
app.get("/api/notifications", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const filtered = notifications.filter(n => n.societyId === societyId);
  res.json(filtered);
});

// Mark all as read
app.post("/api/notifications/read-all", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  notifications = notifications.map(n => n.societyId === societyId ? { ...n, isRead: true } : n);
  const filtered = notifications.filter(n => n.societyId === societyId);
  res.json({ status: "success", count: filtered.length });
});

// Clear single notification
app.delete("/api/notifications/:id", (req: Request, res: Response) => {
  notifications = notifications.filter(n => n.id !== req.params.id);
  res.json({ status: "success" });
});

// GET list of society announcements
app.get("/api/announcements", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const filtered = appAnnouncements.filter(a => a.societyId === societyId);
  res.json(filtered);
});

// Create society announcements (admin tool)
app.post("/api/announcements", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const { title, content, sender, priority } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: "Title and content required" });
    return;
  }
  const newAnn = {
    id: `ann-${Math.random().toString(36).substr(2, 9)}`,
    societyId,
    title,
    content,
    sender: sender || "Society Management Committee",
    date: new Date().toISOString(),
    priority: priority || "Normal"
  };
  appAnnouncements.unshift(newAnn);
  dispatchLocalNotification(societyId, "New Announcement Published", title, "announcement");
  res.json(newAnn);
});

// GET all active complains
app.get("/api/complaints", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const filtered = complaints.filter(c => c.societyId === societyId);
  res.json(filtered);
});

// POST a standard text-based complaint
app.post("/api/complaints/text", async (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const { text, residentName, flatNumber, category: chosenCategory } = req.body;
  if (!text) {
    res.status(400).json({ error: "Complaint text details required" });
    return;
  }

  const ai = getGeminiClient();
  let analysis = {
    summary: text.slice(0, 45) + (text.length > 45 ? "..." : ""),
    category: chosenCategory || "Others",
    severity: "Medium" as "Low" | "Medium" | "High"
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this housing society resident grievance. Generate:
        1. A brief summary sentence (max 8 words).
        2. Assign a category: 'Plumbing', 'Electrical', 'Security', 'Sanitation', 'Rules infraction', 'Others'.
        3. Rate urgency/severity: 'Low', 'Medium', 'High'.
        
        Resident grievance: "${text}"
        
        Respond STRICTLY with valid JSON:
        {
          "summary": "one liner description",
          "category": "Plumbing" | "Electrical" | "Security" | "Sanitation" | "Rules infraction"| "Others",
          "severity": "Low" | "Medium" | "High"
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });
      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        analysis.summary = parsed.summary || analysis.summary;
        analysis.category = parsed.category || analysis.category;
        analysis.severity = parsed.severity || analysis.severity;
      }
    } catch (e) {
      console.error("Gemini context analysis failed, falling back to basic extraction:", e);
    }
  }

  const newComp: Complaint & { societyId: string } = {
    id: `comp-${Math.random().toString(36).substr(2, 9)}`,
    societyId,
    residentName: residentName || "Resident (Self)",
    flatNumber: flatNumber || "Tower A-404",
    text,
    summary: analysis.summary,
    category: analysis.category as any,
    severity: analysis.severity as any,
    status: "Pending",
    timestamp: new Date().toISOString()
  };

  complaints.unshift(newComp);
  dispatchLocalNotification(societyId, "Complaint Filed successfully", `Your ${newComp.category} issue has been logged. Status: Pending.`, "complaint");
  res.json(newComp);
});

// POST voice recording complaint (transcribed by Gemini Audio model!)
app.post("/api/complaints/voice", async (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const { audioData, mimeType, residentName, flatNumber } = req.body;
  if (!audioData) {
    res.status(400).json({ error: "No voice record data provided" });
    return;
  }

  const ai = getGeminiClient();

  // If Gemini is offline/no key, we mock a highly immersive and contextualized receipt!
  if (!ai) {
    // Elegant simulation of a voice recording receipt
    const mockCaptures = [
      {
        text: "Yes, hello, the street lighting outside Block C is completely out of order since yesterday night and matches are pitch black. My children are scared to go downstairs. Please resolve.",
        summary: "Street lights outside Block C completely dark",
        category: "Electrical" as any,
        severity: "High" as any
      },
      {
        text: "There is some stray dog inside the clubhouse entrance area growling at kids swimming nearby. Security guard Rahul was not present. Please take notice.",
        summary: "Stray dog in clubhouse threating residents",
        category: "Security" as any,
        severity: "High" as any
      },
      {
        text: "The trash collection helper skipped flat 1105 doors today as well. This is the third time this week, hygiene is getting affected. Sort this.",
        summary: "Trash pickup vehicle skipped unit 1105",
        category: "Sanitation" as any,
        severity: "Medium" as any
      }
    ];

    const randomMock = mockCaptures[Math.floor(Math.random() * mockCaptures.length)];

    const newComp: Complaint & { societyId: string } = {
      id: `comp-${Math.random().toString(36).substr(2, 9)}`,
      societyId,
      residentName: residentName || "Resident (Self)",
      flatNumber: flatNumber || "Tower A-404",
      text: randomMock.text + " *(Translated from mock offline voice)*",
      summary: randomMock.summary,
      category: randomMock.category,
      severity: randomMock.severity,
      isAudio: true,
      status: "Pending",
      timestamp: new Date().toISOString()
    };

    complaints.unshift(newComp);
    dispatchLocalNotification(societyId, "Voice Complaint Registered", `Successfully processed complaint: '${newComp.summary}'`, "complaint");
    res.json(newComp);
    return;
  }

  try {
    // Standard Base64 processing for Gemini API audio analysis
    const cleanBase64 = audioData.split(",")[1] || audioData;
    const resolvedMime = mimeType || "audio/webm";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: resolvedMime,
            data: cleanBase64
          }
        },
        {
          text: `This is a voice complaint audio file recorded by a residential housing complex citizen. 
          Please analyze this recorded sound files:
          1. Transcribe the audio exactly. If it is in Hindi, Marathi, Spanish, or any other language, please translate it clearly to clean English content.
          2. Generate a highly concise summary of the issue (under 8 words).
          3. Evaluate priority into severity: 'Low', 'Medium', 'High'.
          4. Categorize it to exactly one of the following: 'Plumbing', 'Electrical', 'Security', 'Sanitation', 'Rules infraction', 'Others'.

          Respond strictly with JSON containing these keys:
          {
            "text": "Exact English transcribed/translated query",
            "summary": "Cohesive one sentence issue tracker",
            "category": "Plumbing" | "Electrical" | "Security" | "Sanitation" | "Rules infraction"| "Others",
            "severity": "Low" | "Medium" | "High"
          }`
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    if (!response || !response.text) {
      throw new Error("No transcription text returned from Gemini API");
    }

    const result = JSON.parse(response.text.trim());

    const newComp: Complaint & { societyId: string } = {
      id: `comp-${Math.random().toString(36).substr(2, 9)}`,
      societyId,
      residentName: residentName || "Resident (Self)",
      flatNumber: flatNumber || "Tower A-404",
      text: result.text,
      summary: result.summary,
      category: result.category,
      severity: result.severity,
      isAudio: true,
      status: "Pending",
      timestamp: new Date().toISOString()
    };

    complaints.unshift(newComp);
    dispatchLocalNotification(societyId, "AI Voice Complaint Sent", `Panchayat AI translated your issue and put it in the society inbox. Category: ${newComp.category}`, "complaint");
    res.json(newComp);
  } catch (err: any) {
    console.error("Transcribing voice complaint error:", err);
    res.status(500).json({ error: "Failed to translate audio file. Please try typing instead, or ensure valid credentials." });
  }
});

// Resolve complaints (admin/committee tool)
app.post("/api/complaints/:id/resolve", (req: Request, res: Response) => {
  const { id } = req.params;
  const { responseText } = req.body;
  const compIndex = complaints.findIndex(c => c.id === id);

  if (compIndex === -1) {
    res.status(404).json({ error: "Complaint not found" });
    return;
  }

  const actSocId = complaints[compIndex].societyId || "def-greenwood";
  complaints[compIndex].status = "Resolved";
  complaints[compIndex].responseText = responseText || "Issue inspected and completed by the society on-duty supervisor.";
  
  dispatchLocalNotification(
    actSocId,
    "Complaint Resolved!",
    `Your ticket '${complaints[compIndex].summary}' is marked Resolved.`,
    "complaint"
  );

  res.json(complaints[compIndex]);
});

// GET directory of staff (custom map based on active society!)
app.get("/api/services/directory", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const activeStaff = societyStaffMap[societyId] || SERVICE_STAFF_DIRECTORY;
  res.json(activeStaff);
});

// POST register a new service staff member in the directory
app.post("/api/services/directory", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const { name, category, phone, baseCharge, avatar } = req.body;

  if (!name || !category || !phone) {
    res.status(400).json({ error: "Name, category and phone details are required to list staff." });
    return;
  }

  // Ensure map is populated for this society
  if (!societyStaffMap[societyId]) {
    societyStaffMap[societyId] = [...SERVICE_STAFF_DIRECTORY];
  }

  const newStaff: ServiceStaff = {
    id: `st-${Math.random().toString(36).substr(2, 9)}`,
    name,
    category,
    phone,
    rating: 4.8,
    contactName: name,
    isAvailable: true,
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    experienceYears: Math.floor(Math.random() * 5) + 3,
    baseCharge: baseCharge || "₹150 / Visit"
  };

  societyStaffMap[societyId].push(newStaff);

  // Dispatch announcement
  dispatchLocalNotification(
    societyId,
    "New Staff Added",
    `${name} has been enrolled as a registered ${category} for our society.`,
    "announcement"
  );

  res.json({ success: true, staff: newStaff });
});

// DELETE a service staff member from the directory
app.delete("/api/services/directory/:id", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const { id } = req.params;

  if (!societyStaffMap[societyId]) {
    res.status(404).json({ error: "Society directory not found." });
    return;
  }

  societyStaffMap[societyId] = societyStaffMap[societyId].filter(staff => staff.id !== id);

  res.json({ success: true, message: "Staff member removed successfully." });
});

// GET live booking list
app.get("/api/service-requests", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const filtered = serviceRequests.filter(s => s.societyId === societyId);
  res.json(filtered);
});

// POST book service staff
app.post("/api/service-requests", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const { staffId, flatNumber, timeSlot, notes } = req.body;
  
  const activeStaff = societyStaffMap[societyId] || SERVICE_STAFF_DIRECTORY;
  const staff = activeStaff.find(s => s.id === staffId);
  if (!staff) {
    res.status(404).json({ error: "Service staff not found" });
    return;
  }

  // Parse numeric amount from baseCharge
  let numericAmount = 199;
  if (staff.baseCharge.includes("199")) numericAmount = 199;
  else if (staff.baseCharge.includes("149")) numericAmount = 149;
  else if (staff.baseCharge.includes("249")) numericAmount = 249;
  else if (staff.baseCharge.includes("129")) numericAmount = 129;
  else if (staff.baseCharge.includes("40") || staff.baseCharge.includes("35")) numericAmount = 160; // laundry multiplier
  else if (staff.baseCharge.includes("499")) numericAmount = 499;
  else if (staff.baseCharge.includes("300")) numericAmount = 300;
  else if (staff.baseCharge.includes("899")) numericAmount = 899;

  const newRequest: ServiceRequest & { societyId: string } = {
    id: `req-${Math.random().toString(36).substr(2, 9)}`,
    societyId,
    staffId,
    staffName: staff.name,
    category: staff.category,
    flatNumber: flatNumber || "Tower A-404",
    timeSlot: timeSlot || "Tomorrow, 10:00 AM - 12:00 PM",
    status: "Requested",
    timestamp: new Date().toISOString(),
    notes: notes || "",
    paymentStatus: "Unpaid",
    amount: numericAmount
  };

  serviceRequests.unshift(newRequest);

  dispatchLocalNotification(
    societyId,
    "Service Requested",
    `Placing request for ${staff.category} (${staff.name}) for time ${newRequest.timeSlot}`,
    "service"
  );

  // Trigger reactive progress updates for this specific society environment
  simulateRequestProgress(societyId, newRequest.id, staff.name);

  res.json(newRequest);
});

// GET payment history list
app.get("/api/payments/history", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const filtered = transactions.filter(t => t.societyId === societyId);
  res.json(filtered);
});

// POST process payment securely for a booking
app.post("/api/service-requests/:id/pay", (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentMethod, amount } = req.body;

  const request = serviceRequests.find(r => r.id === id);
  if (!request) {
    res.status(404).json({ error: "Service request not found" });
    return;
  }

  const actSocId = request.societyId || "def-greenwood";
  const txnId = `TXN${Math.floor(Math.random() * 900000000 + 100000000)}`;
  
  request.paymentStatus = "Paid";
  request.transactionId = txnId;

  const newTxn: Transaction & { societyId: string } = {
    id: `tx-${Math.random().toString(36).substr(2, 9)}`,
    societyId: actSocId,
    requestId: id,
    staffName: request.staffName,
    category: request.category,
    amount: amount || request.amount || 199,
    paymentMethod: paymentMethod || "UPI",
    status: "Success",
    timestamp: new Date().toISOString(),
    transactionId: txnId
  };

  transactions.unshift(newTxn);

  dispatchLocalNotification(
    actSocId,
    "Payment Successful",
    `Payment of ₹${newTxn.amount} for ${request.category} (${request.staffName}) processed successfully via ${newTxn.paymentMethod}. Trans ID: ${txnId}`,
    "service"
  );

  res.json({
    success: true,
    transaction: newTxn,
    request
  });
});

// GET active visitor records
app.get("/api/visitors", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const filtered = visitorLogs.filter(v => v.societyId === societyId);
  res.json(filtered);
});

// POST Action (Approve / Deny / Checkout) on a visitor
app.post("/api/visitors/:id/action", (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body; // "Approve" | "Deny" | "Checkout"
  
  const visIndex = visitorLogs.findIndex(v => v.id === id);
  if (visIndex === -1) {
    res.status(404).json({ error: "Visitor document not found" });
    return;
  }

  const visitor = visitorLogs[visIndex];
  const actSocId = visitor.societyId || "def-greenwood";

  if (action === "Approve") {
    visitor.status = "Approved";
    dispatchLocalNotification(
      actSocId,
      "Visitor Checked In",
      `${visitor.visitorName} (${visitor.purpose}) check-in was approved.`,
      "visitor"
    );
  } else if (action === "Deny") {
    visitor.status = "Denied";
    dispatchLocalNotification(
      actSocId,
      "Visitor Blocked",
      `Access denied for ${visitor.visitorName} (${visitor.purpose}).`,
      "visitor"
    );
  } else if (action === "Checkout") {
    visitor.status = "Checked Out";
    dispatchLocalNotification(
      actSocId,
      "Visitor Departed",
      `${visitor.visitorName} has logged checkout exit at the primary gate.`,
      "visitor"
    );
  }

  res.json(visitor);
});

// --- Authentication, Verification & Subscription Endpoints ---

// Verify details against pre-authorized database list
app.post("/api/auth/verify-database", (req: Request, res: Response) => {
  const { name, email, flatNumber, societyId } = req.body;
  if (!email || !societyId) {
    res.status(400).json({ error: "Email and Society are required for verification." });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedName = name ? name.toLowerCase().trim() : "";
  const normalizedFlat = flatNumber ? flatNumber.toLowerCase().trim() : "";

  // Look for any registered record by email (or name/flat combo)
  const match = preRegisteredResidents.find(r => 
    r.societyId === societyId && 
    (r.email.toLowerCase() === normalizedEmail || 
     (normalizedName && r.name.toLowerCase().includes(normalizedName) && normalizedFlat && r.flatNumber.toLowerCase().includes(normalizedFlat)))
  );

  if (match) {
    res.json({ isRegistered: true, resident: match });
  } else {
    res.json({ isRegistered: false });
  }
});

// Register new or verify existing user session with subscription tier
app.post("/api/auth/register-and-subscribe", (req: Request, res: Response) => {
  const { name, email, flatNumber, phone, societyId, subscriptionType, password } = req.body;
  if (!name || !email || !flatNumber || !phone || !societyId) {
    res.status(400).json({ error: "Name, email, flat number, phone and society are required fields." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanSub = subscriptionType || "Free";

  // Compute expiration
  const now = Date.now();
  let msToAdd = 7 * 24 * 3600 * 1000; // default 1 week trial
  if (cleanSub === "1Month") msToAdd = 30 * 24 * 3600 * 1000;
  else if (cleanSub === "4Months") msToAdd = 120 * 24 * 3600 * 1000;
  else if (cleanSub === "1Year") msToAdd = 365 * 24 * 3600 * 1000;

  const expiresAt = new Date(now + msToAdd).toISOString();

  // Check if they are matched in the pre-registered resident database
  const isPreRegistered = preRegisteredResidents.some(r => 
    r.societyId === societyId && r.email.toLowerCase() === cleanEmail
  );

  // If they are registering but are not in pre-registered record, we dynamically verify them 
  // as self-submitted and store them in pre-registered array so they can login seamlessly in future
  if (!isPreRegistered) {
    preRegisteredResidents.push({
      societyId,
      name,
      flatNumber,
      email: cleanEmail,
      phone,
      password: password || "123",
      age: req.body.age ? Number(req.body.age) : undefined,
      gender: req.body.gender || undefined,
      familyMembers: Array.isArray(req.body.familyMembers) ? req.body.familyMembers : []
    });
  } else {
    // Update password if they were pre-registered and now set a custom password
    const regIdx = preRegisteredResidents.findIndex(r => r.societyId === societyId && r.email.toLowerCase() === cleanEmail);
    if (regIdx !== -1 && password) {
      preRegisteredResidents[regIdx].password = password;
    }
  }

  // Create active session user
  const newUser: AppUser = {
    id: `usr-${Math.random().toString(36).substr(2, 9)}`,
    societyId,
    name,
    flatNumber,
    email: cleanEmail,
    phone,
    isRegisteredResident: true,
    subscriptionType: cleanSub,
    subscriptionExpiresAt: expiresAt,
    createdAt: new Date().toISOString(),
    age: req.body.age ? Number(req.body.age) : undefined,
    gender: req.body.gender || undefined,
    familyMembers: Array.isArray(req.body.familyMembers) ? req.body.familyMembers : [],
    password: password || "123"
  };

  // Keep search tracking active, clear historical duplicate sessions
  appUsers = appUsers.filter(u => u.email !== cleanEmail);
  appUsers.push(newUser);

  // Dispatch a notification
  dispatchLocalNotification(
    societyId,
    "Membership Active",
    `Premium subscription level '${cleanSub}' successfully calibrated until ${new Date(expiresAt).toLocaleDateString()}. Welcome to our safe enclave!`,
    "announcement"
  );

  // Trigger simulated welcome email to the new resident
  const targetSoc = registeredSocieties.find(s => s.id === societyId);
  sendWelcomeEmail(cleanEmail, name, "Resident Member", targetSoc ? targetSoc.name : "Panchayat");

  res.json({ success: true, user: newUser });
});

// Login for existing users
app.post("/api/auth/login-existing", (req: Request, res: Response) => {
  const { email, societyId, password } = req.body;
  if (!email || !societyId) {
    res.status(400).json({ error: "Email and Society are required." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check if they are in our official society preRegisteredResidents list
  const registryMatch = preRegisteredResidents.find(r => 
    r.societyId === societyId && r.email.toLowerCase() === cleanEmail
  );

  if (!registryMatch) {
    res.status(404).json({ 
      error: "We could not find your credentials in this society's database. If you are a new resident, please click 'New User' to verify your status or request direct administrative entry." 
    });
    return;
  }

  // Validate Password
  const expectedPassword = registryMatch.password || "123";
  if (password !== expectedPassword) {
    res.status(401).json({ error: "Incorrect email or password. Please try again." });
    return;
  }

  // Check if there's an existing appUser profile, or generate a default 1-week free session
  let user = appUsers.find(u => u.email === cleanEmail && u.societyId === societyId);
  if (!user) {
    user = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      societyId,
      name: registryMatch.name,
      flatNumber: registryMatch.flatNumber,
      email: cleanEmail,
      phone: registryMatch.phone,
      isRegisteredResident: true,
      subscriptionType: "Free",
      subscriptionExpiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), // 1 week free trial
      createdAt: new Date().toISOString(),
      age: registryMatch.age,
      gender: registryMatch.gender,
      familyMembers: registryMatch.familyMembers || [],
      password: expectedPassword
    };
    appUsers.push(user);
  } else {
    // Sync attributes if they were registered from registry
    user.age = registryMatch.age;
    user.gender = registryMatch.gender;
    user.familyMembers = registryMatch.familyMembers || [];
    user.password = expectedPassword;
  }

  // Trigger simulated welcome email to existing resident on login/portal entry
  const targetSoc = registeredSocieties.find(s => s.id === societyId);
  sendWelcomeEmail(cleanEmail, registryMatch.name, "Resident Member", targetSoc ? targetSoc.name : "Panchayat");

  res.json({ success: true, user });
});

// Secure admin/caretaker login with email and password
app.post("/api/auth/login-owner", (req: Request, res: Response) => {
  const { email, password, societyId } = req.body;
  if (!email || !societyId || !password) {
    res.status(400).json({ error: "Email, password, and Society are required." });
    return;
  }

  const activeSoc = registeredSocieties.find(s => s.id === societyId);
  if (!activeSoc) {
    res.status(404).json({ error: "Society not found." });
    return;
  }

  // Default to admin@greenwood.com with password 'admin' if Greenwood Heights, or adapt to admin@[societyid].com
  const expectedEmail = activeSoc.adminEmail || `admin@${activeSoc.id === "def-greenwood" ? "greenwood" : activeSoc.id}.com`;
  const expectedPassword = activeSoc.adminPassword || "admin";

  if (email.toLowerCase().trim() !== expectedEmail.toLowerCase().trim() || password !== expectedPassword) {
    res.status(401).json({ error: "Invalid caretaker email or password. Try standard default caretaker credentials (e.g. email: admin@greenwood.com, password: admin)." });
    return;
  }

  const user: AppUser = {
    id: `owner-${activeSoc.id}`,
    societyId: activeSoc.id,
    name: activeSoc.adminName,
    flatNumber: "Mgmt Office",
    email: email.toLowerCase().trim(),
    phone: activeSoc.adminPhone,
    isRegisteredResident: true,
    subscriptionType: "1Year",
    subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    role: "admin",
    password: expectedPassword
  };

  // Trigger simulated welcome email to caretaker/owner on login/portal entry
  sendWelcomeEmail(email.toLowerCase().trim(), activeSoc.adminName || "Society Administrator", "Society Creator/Caretaker", activeSoc.name);

  res.json({ success: true, user });
});

// GET all registered residents for the active society
app.get("/api/residents", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const filtered = preRegisteredResidents.filter(r => r.societyId === societyId);
  res.json(filtered);
});

// POST to add/create a new resident in the society database (admin tool)
app.post("/api/residents", (req: Request, res: Response) => {
  const societyId = getSocietyId(req);
  const { name, email, flatNumber, phone, password, age, gender } = req.body;
  
  if (!name || !email || !flatNumber || !phone) {
    res.status(400).json({ error: "Name, email, flat number and phone contact are required." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check if duplicate resident email in this society
  const isDuplicate = preRegisteredResidents.some(r => 
    r.societyId === societyId && r.email.toLowerCase() === cleanEmail
  );

  if (isDuplicate) {
    res.status(400).json({ error: "A resident with this email is already registered in this society." });
    return;
  }

  const newResident: ResidentRegistry = {
    societyId,
    name,
    flatNumber,
    email: cleanEmail,
    phone,
    password: password || "123", // fallback default password
    age: age ? Number(age) : undefined,
    gender: gender || undefined,
    familyMembers: []
  };

  preRegisteredResidents.push(newResident);

  // Send a welcome system notification
  dispatchLocalNotification(
    societyId,
    "Resident Enrolled Successfully",
    `Resident ${name} (Flat ${flatNumber}) was registered directly by management.`,
    "announcement"
  );

  res.json({ success: true, resident: newResident });
});

// Renew / Purchase subscriptions
app.post("/api/auth/renew-subscription", (req: Request, res: Response) => {
  const { email, subscriptionType } = req.body;
  if (!email || !subscriptionType) {
    res.status(400).json({ error: "Email and Subscription Type are required." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = appUsers.find(u => u.email === cleanEmail);
  if (!user) {
    res.status(404).json({ error: "Session user profile not found." });
    return;
  }

  const now = Date.now();
  let msToAdd = 30 * 24 * 3600 * 1000; // 1 Month Default (₹50)
  if (subscriptionType === "4Months") msToAdd = 120 * 24 * 3600 * 1000; // ₹150 for 4 Months
  else if (subscriptionType === "1Year") msToAdd = 365 * 24 * 3600 * 1000; // ₹400 for 1 Year

  const newExpiry = new Date(now + msToAdd).toISOString();
  user.subscriptionType = subscriptionType;
  user.subscriptionExpiresAt = newExpiry;

  dispatchLocalNotification(
    user.societyId,
    "Membership Extended",
    `Thank you! Your subscription renewed successfully for '${subscriptionType}'. Portal service active until ${new Date(newExpiry).toLocaleDateString()}.`,
    "announcement"
  );

  res.json({ success: true, user });
});

// Update Profile Picture
app.post("/api/auth/update-profile", (req: Request, res: Response) => {
  const { email, profilePictureUrl } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = appUsers.find(u => u.email === cleanEmail);
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  user.profilePictureUrl = profilePictureUrl;

  res.json({ success: true, user });
});

// Fast-forward simulation of subscription expiration to test the paywall
app.post("/api/auth/simulate-expire", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email parameter required." });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = appUsers.find(u => u.email === cleanEmail);
  if (!user) {
    res.status(404).json({ error: "User session not found." });
    return;
  }

  // Set expiration to yesterday
  user.subscriptionExpiresAt = new Date(Date.now() - 3600 * 24 * 1000).toISOString();
  res.json({ success: true, user });
});

// --- CHAT ENDPOINTS ---
app.get("/api/chat", (req: Request, res: Response) => {
  const socId = getSocietyId(req);
  const messages = chatMessages.filter(m => m.societyId === socId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json(messages);
});

app.post("/api/chat", (req: Request, res: Response) => {
  const { senderId, senderName, senderFlat, text } = req.body;
  const socId = getSocietyId(req);

  const newMsg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    societyId: socId,
    senderId: senderId || "unknown",
    senderName: senderName || "Anonymous",
    senderFlat: senderFlat || "Unknown",
    text: text || "",
    timestamp: new Date().toISOString()
  };

  chatMessages.push(newMsg);
  
  // keep last 500 messages per society to avoid memory leak
  const societyMsgs = chatMessages.filter(m => m.societyId === socId);
  if (societyMsgs.length > 500) {
    const oldest = societyMsgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    chatMessages = chatMessages.filter(m => m.id !== oldest.id);
  }

  res.json(newMsg);
});

// --- EMERGENCY SOS CONTROL ENDPOINTS ---

// GET active emergency SOS alerts
app.get("/api/sos/active", (req: Request, res: Response) => {
  const socId = getSocietyId(req);
  const activeSoses = sosAlerts.filter(s => s.societyId === socId);
  res.json(activeSoses);
});

// POST trigger an emergency SOS
app.post("/api/sos/trigger", (req: Request, res: Response) => {
  const { name, flatNumber, phone, locationDetails, latitude, longitude } = req.body;
  const socId = getSocietyId(req);

  const cleanName = name || "Anonymous Resident";
  const cleanFlat = flatNumber || "Tower Unknown";
  const cleanPhone = phone || "+91 99999 11111";
  const cleanLoc = locationDetails || "Main Courtyard Ground";
  const cleanLat = Number(latitude) || 28.4595;
  const cleanLng = Number(longitude) || 77.0266;

  const newAlert: SosAlert = {
    id: `sos-${Math.random().toString(36).substr(2, 9)}`,
    societyId: socId,
    residentName: cleanName,
    flatNumber: cleanFlat,
    phone: cleanPhone,
    locationDetails: cleanLoc,
    latitude: cleanLat,
    longitude: cleanLng,
    timestamp: new Date().toISOString(),
    status: "Active"
  };

  sosAlerts.unshift(newAlert);

  // Dispatch a system-wide high-priority alarm notification
  dispatchLocalNotification(
    socId,
    "⚠️ EMERGENCY SOS TRIGGERED",
    `ALERT: Resident ${cleanName} (Flat ${cleanFlat}) has broadcasted an emergency SOS from ${cleanLoc}! Security dispatch advised immediately. Contact: ${cleanPhone}`,
    "complaint"
  );

  res.json({ success: true, alert: newAlert });
});

// POST resolve active SOS
app.post("/api/sos/:id/resolve", (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = sosAlerts.find(s => s.id === id);
  if (!alert) {
    res.status(404).json({ error: "SOS alert not found." });
    return;
  }

  alert.status = "Resolved";

  dispatchLocalNotification(
    alert.societyId,
    "✅ Emergency SOS Resolved",
    `The security patrol reported that the alarm issued by resident ${alert.residentName} (Flat ${alert.flatNumber}) is now safely resolved.`,
    "service"
  );

  res.json({ success: true, alert });
});

// POST Ask AI chatbot about active Society Rules
app.post("/api/rules/ask", async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) {
    res.status(400).json({ error: "Question prompt required" });
    return;
  }

  const societyId = getSocietyId(req);
  const activeSoc = registeredSocieties.find(s => s.id === societyId) || registeredSocieties[0];
  const activeRulesList = activeSoc.rules || SOCIETY_RULES;
  const activeRulesText = activeSoc.rulesText || RULEBOOK_TEXT;

  const ai = getGeminiClient();

  // If Gemini has no active key or is offline, perform a localized smart keywords scanning of the rules!
  if (!ai) {
    const qLower = question.toLowerCase();
    let localAns = "";
    let matchedCategory = "";

    if (qLower.includes("gym") || qLower.includes("exercise") || qLower.includes("clothe") || qLower.includes("shoes") || qLower.includes("timing")) {
      const gymRules = activeRulesList.find(r => r.category === "Gym") || activeRulesList[0];
      matchedCategory = "Gymnasium Timings & Code";
      localAns = gymRules ? `Regarding the Gym/Clubhouse guidelines: ${gymRules.detail}` : `The society gymnasium is open daily. Clean indoor sports shoes are required.`;
    } else if (qLower.includes("pool") || qLower.includes("swim") || qLower.includes("monday") || qLower.includes("water")) {
      const poolRules = activeRulesList.find(r => r.category === "Swimming Pool") || activeRulesList.find(r => r.category && r.category.toLowerCase().includes("pool"));
      matchedCategory = "Swimming Pool Guidelines";
      localAns = poolRules ? `Rules for swimming pool: ${poolRules.detail}` : `The swimming pool is open with proper nylon or spandex swimwear. Closed on Mondays for chlorination.`;
    } else if (qLower.includes("party") || qLower.includes("hall") || qLower.includes("celebrate") || qLower.includes("community") || qLower.includes("music") || qLower.includes("noise")) {
      const partyRules = activeRulesList.find(r => r.category === "Parties") || activeRulesList.find(r => r.category && r.category.toLowerCase().includes("party"));
      matchedCategory = "Community Hall Bookings & Noise";
      localAns = partyRules ? `Regarding clubhouse parties: ${partyRules.detail}` : `Parties are allowed in the Community Hall. Loud music must shut down at 10 PM.`;
    } else if (qLower.includes("pet") || qLower.includes("dog") || qLower.includes("cat") || qLower.includes("poop") || qLower.includes("leash")) {
      const petRules = activeRulesList.find(r => r.category === "Pets") || activeRulesList.find(r => r.category && r.category.toLowerCase().includes("pet"));
      matchedCategory = "Society Pet Management Bylaws";
      localAns = petRules ? `Regarding pets: ${petRules.detail}` : `Pets must remain leashed. Immediate scoop-up of pet waste mandatory. Violations hold penalties.`;
    } else if (qLower.includes("drill") || qLower.includes("renovate") || qLower.includes("construction") || qLower.includes("repair") || qLower.includes("sunday")) {
      const renoRules = activeRulesList.find(r => r.category === "Renovations") || activeRulesList.find(r => r.category && r.category.toLowerCase().includes("renovate"));
      matchedCategory = "Renovations & Active Hours";
      localAns = renoRules ? `Rules for construction and drilling: ${renoRules.detail}` : `No noisy drills on Sundays. Supported heavy work hours are Monday-Saturday 9 AM to 6 PM.`;
    } else if (qLower.includes("waste") || qLower.includes("garbage") || qLower.includes("trash") || qLower.includes("dry") || qLower.includes("wet") || qLower.includes("segregat")) {
      const wasteRules = activeRulesList.find(r => r.category === "Refuse") || activeRulesList.find(r => r.category && r.category.toLowerCase().includes("refuse"));
      matchedCategory = "Waste Management & Segregation";
      localAns = wasteRules ? `Rule on waste disposal: ${wasteRules.detail}` : `Door garbage collection scheduled daily. Multi-coloured segregation of Wet (organic) and Dry waste is mandatory.`;
    } else if (qLower.includes("visitor") || qLower.includes("park") || qLower.includes("car") || qLower.includes("scooter") || qLower.includes("charge")) {
      const parkRules = activeRulesList.find(r => r.category === "Visitors") || activeRulesList.find(r => r.category && r.category.toLowerCase().includes("park"));
      matchedCategory = "Visitor Parking Allowances";
      localAns = parkRules ? `Rule on visitors: ${parkRules.detail}` : `Visitor parking spaces are stationed on Ground level. Check rules for free hour configurations.`;
    } else {
      matchedCategory = `General ${activeSoc.name} Standards`;
      localAns = `Welcome to '${activeSoc.name}'. We maintain clear standards for quiet residential living, environmental cleanliness, and automated security at the primary checkpoint.`;
    }

    res.json({
      answer: localAns,
      category: matchedCategory,
      isMock: true,
      tip: `Panchayat AI is running in quick context matching mode for ${activeSoc.name}. Unconfigured GEMINI_API_KEY. Write a key in settings to unlock conversational natural logic!`
    });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are the friendly AI Resident Assistant named 'Panchayat' for ${activeSoc.name}. 
      Analyze the resident's query and answer it strictly based on the ${activeSoc.name} custom rulebook below.
      
      Here is the official rulebook for ${activeSoc.name}:
      ======================================================
      ${activeRulesText}
      ======================================================

      RESIDENT'S QUESTION:
      "${question}"

      INSTRUCTIONS:
      1. Provide a direct, highly polite, conversational, yet authoritative answer based and sourced ONLY from the rulebook above.
      2. If the rulebook doesn't mention the subject or topic, politely say that you couldn't find details on that in the ${activeSoc.name} bylaws, suggest they contact their society's management office, and offer a small, helpful, and logical community advice (e.g. standard residential etiquette) for the situation.
      3. Use clear formatting, keep the styling clean and highly readable.
      4. Avoid jargon. Mention specific sections if relevant.
      5. Do not include markdown code ticks, just standard formatted text.`
    });

    if (!response || !response.text) {
      throw new Error("No answer text received from Gemini API");
    }

    res.json({
      answer: response.text.trim(),
      isMock: false
    });
  } catch (err: any) {
    console.error("AI Rules Query failed:", err);
    res.status(500).json({ error: "AI Assistant was unable to process your prompt. Please try again." });
  }
});

// Start server and handle static client files
async function startServer() {
  // Vite integration in Dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving of Vite's compiled outputs
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Panchayat server running on http://localhost:${PORT}`);
  });
}

startServer();
