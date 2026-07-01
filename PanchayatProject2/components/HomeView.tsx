import { motion } from "motion/react";
import { 
  Building2, 
  MapPin, 
  Megaphone, 
  Shield, 
  UserCheck, 
  Check, 
  X, 
  Clock, 
  Wrench, 
  Settings, 
  Video, 
  ArrowRight, 
  Info,
  Calendar,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { Announcement, VisitorRecord, ServiceRequest, Society, SosAlert } from "../types";

interface HomeViewProps {
  announcements: Announcement[];
  visitors: VisitorRecord[];
  requests: ServiceRequest[];
  onActionVisitor: (id: string, action: 'Approve' | 'Deny') => void;
  onNavigateTab: (tab: string) => void;
  selectedSociety?: Society | null;
  activeSoses: SosAlert[];
  onTriggerSos: (locationDetails?: string) => void;
  onResolveSos: (id: string) => void;
  onNavigateOfflineMap: () => void;
}

export default function HomeView({
  announcements,
  visitors,
  requests,
  onActionVisitor,
  onNavigateTab,
  selectedSociety,
  activeSoses,
  onTriggerSos,
  onResolveSos,
  onNavigateOfflineMap
}: HomeViewProps) {
  
  // Format dates elegantly
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const activeVisitors = visitors.filter(v => v.status === "Waiting at Gate");
  const approvedVisitors = visitors.filter(v => v.status === "Approved");
  const ongoingBookings = requests.filter(r => r.status !== "Completed" && r.status !== "Cancelled");

  // Dynamically resolve rules reminders based on selected society rules lists!
  const hasCustomRules = selectedSociety && selectedSociety.rules && selectedSociety.rules.length > 0;
  const renderRulesReminders = () => {
    if (hasCustomRules && selectedSociety.rules) {
      return selectedSociety.rules.slice(0, 3).map((r, idx) => (
        <p key={idx}>• **{r.category}**: {r.title} — {r.detail.slice(0, 50)}...</p>
      ));
    }
    return (
      <>
        <p>• **Gym** open daily from **6:00 AM to 10:00 PM**.</p>
        <p>• **Pool** remains completely **CLOSED on Mondays**.</p>
        <p>• **Heavy Music** within community hall must end at **10 PM**.</p>
      </>
    );
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Active Broadcast Emergency SOS Banner */}
      {activeSoses && activeSoses.length > 0 && (
        <div className="bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-2 border-red-500 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden animate-pulse">
          <div className="absolute top-0 right-0 p-1 bg-red-600 text-[8.5px] uppercase font-mono font-black tracking-widest rounded-bl-xl px-2.5">
            EMERGENCY BROADCAST
          </div>
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-red-600 rounded-xl text-white shrink-0 shadow-md">
              <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-xs text-red-100 uppercase tracking-tight">
                CRITICAL SIREN ACTIVE
              </h3>
              <p className="text-[10px] text-red-200 mt-0.5">
                Volunteers and guard house have been notified with coordinates.
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {activeSoses.map(sos => (
              <div key={sos.id} className="bg-red-900/60 border border-red-500/20 rounded-xl p-3 text-xs flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between font-bold text-orange-200">
                  <span>👤 {sos.residentName} (Unit: {sos.flatNumber})</span>
                  <span className="text-[10px] text-neutral-300 font-mono">⚡ Active</span>
                </div>
                <p className="text-[11px] text-red-100">
                  📍 <strong>Live Tracker:</strong> {sos.locationDetails} ({sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)})
                </p>
                <div className="flex items-center justify-between text-[9.5px] text-neutral-400 pt-1.5 border-t border-red-800">
                  <span>Triggered at {new Date(sos.timestamp).toLocaleTimeString()}</span>
                  <button
                    onClick={() => onResolveSos(sos.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1 px-2.5 rounded-lg active:scale-95 transition-all outline-none"
                  >
                    RESOLVE SIREN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Society Grand Banner */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-2xl p-4.5 shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -left-12 -top-12 w-24 h-24 bg-white/5 rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-full backdrop-blur-md">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-indigo-200/90 font-mono">My Society Portal</p>
              <h2 className="font-display font-bold text-base leading-tight">
                {selectedSociety?.name || "Greenwood Heights Society"}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[10.5px] text-indigo-100/80 mt-2.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-300" />
            <span className="truncate">
              {selectedSociety?.address ? `${selectedSociety.address}, ${selectedSociety.city}` : "Sector 14, Royal Greens Enclave"}
            </span>
          </div>

          {/* Quick Info Box */}
          <div className="bg-indigo-950/40 border border-indigo-700/30 rounded-xl p-2.5 mt-3 backdrop-blur-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-100 font-medium">
                {selectedSociety?.unitsCount || 450} Residential Units Online
              </span>
            </div>
            <span className="text-[10px] bg-amber-400 text-indigo-950 px-2 py-0.5 rounded-full font-bold font-mono">ACTIVE GATE</span>
          </div>
        </div>
      </div>

      {/* Prominent Emergency 'SOS Launcher' Button Card */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-4.5 shadow-xl border border-red-500 relative overflow-hidden text-left">
        <div className="absolute right-[-10px] bottom-[-10px] text-white opacity-10">
          <ShieldAlert className="w-20 h-20 stroke-[1]" />
        </div>
        
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <h4 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping shrink-0" />
              Emergency SOS Beacon
            </h4>
            <p className="text-[10.5px] text-red-100 max-w-[210px] leading-snug">
              Send immediate siren broadcast to guard office and display your tower coordinates now.
            </p>
          </div>

          <button
            onClick={() => {
              const loc = prompt("Specify emergency note or custom location (e.g., Tower D - Floor 5, or Parking Slot B4):", "Tower B - Floor 3");
              if (loc !== null) {
                onTriggerSos(loc);
              }
            }}
            className="px-4 py-3 bg-white text-rose-700 hover:bg-rose-50 text-xs font-black rounded-xl shadow-lg active:scale-95 transition-all outline-none flex items-center gap-1.5 shrink-0 select-none cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <ShieldAlert className="w-4 h-4 animate-bounce text-red-600" />
            ALERT SEC
          </button>
        </div>
      </div>

      {/* Real-time Visitor Approvals (Like MyGate) */}
      {activeVisitors.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-rose-600" />
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-50">
            <h3 className="font-display font-semibold text-xs text-rose-800 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-500 animate-pulse" />
              Gatekeeper Authorization Required
            </h3>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-md uppercase font-mono">Waiting</span>
          </div>

          <div className="space-y-3">
            {activeVisitors.map(vis => (
              <motion.div 
                key={vis.id}
                layoutId={`vis-${vis.id}`}
                className="flex items-center justify-between bg-rose-50/40 p-3 rounded-xl border border-rose-100/50"
              >
                <div>
                  <h4 className="text-xs font-semibold text-neutral-800 font-display">{vis.visitorName}</h4>
                  <p className="text-[11px] text-rose-700 font-mono mt-0.5">{vis.purpose}</p>
                  <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Waiting standard lobby entry since {vis.entryTime}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onActionVisitor(vis.id, 'Deny')}
                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg active:scale-95 transition-all text-xs font-medium flex items-center gap-1 shrink-0"
                    title="Deny entry"
                  >
                    <X className="w-4 h-4" /> Deny
                  </button>
                  <button
                    onClick={() => onActionVisitor(vis.id, 'Approve')}
                    className="p-1.5 bg-brand-emerald text-white hover:bg-emerald-800 rounded-lg active:scale-95 transition-all text-xs font-semibold flex items-center gap-1 shrink-0 shadow-sm"
                    title="Approve entry"
                  >
                    <Check className="w-4 h-4 text-amber-300" /> Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : approvedVisitors.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
          <h3 className="font-display font-semibold text-xs text-indigo-800 flex items-center gap-1.5 mb-2.5">
            <UserCheck className="w-4 h-4 text-indigo-600 animate-pulse" />
            Approved Guest Logs
          </h3>
          <div className="space-y-2">
            {approvedVisitors.slice(0, 1).map(vis => (
              <div key={vis.id} className="text-xs flex items-center justify-between text-neutral-600 bg-indigo-50/30 p-2 rounded-xl">
                <span>{vis.visitorName} ({vis.purpose}) entered lobby</span>
                <span className="text-[10px] text-indigo-600 font-semibold font-mono bg-indigo-100 px-1.5 py-0.5 rounded">PASSED GATE</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab("complaints")}
          className="flex flex-col items-center p-3.5 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all active:scale-95 group text-center"
        >
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-2 group-hover:bg-rose-100 transition-colors">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-neutral-700 leading-tight">File Complaint</span>
        </button>

        <button
          onClick={() => onNavigateTab("services")}
          className="flex flex-col items-center p-3.5 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all active:scale-95 group text-center"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-2 group-hover:bg-amber-100 transition-colors">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-neutral-700 leading-tight">Book Plumber</span>
        </button>

        <button
          onClick={() => onNavigateTab("services")}
          className="flex flex-col items-center p-3.5 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all active:scale-95 group text-center"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-2 group-hover:bg-blue-100 transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-neutral-700 leading-tight">Laundry Help</span>
        </button>

        <button
          onClick={() => onNavigateTab("rulebook")}
          className="flex flex-col items-center p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-2xl shadow-sm hover:bg-indigo-100 transition-all active:scale-95 group text-center"
        >
          <div className="w-10 h-10 bg-brand-emerald rounded-xl flex items-center justify-center text-amber-300 mb-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-brand-emerald leading-tight">Ask Rules AI</span>
        </button>
      </div>

      {/* Ongoing Service Bookings with Real-time Trackers */}
      {ongoingBookings.length > 0 && (
        <div className="bg-white rounded-2xl p-4.5 border border-neutral-100 shadow-sm mb-2">
          <h3 className="font-display font-semibold text-xs text-neutral-700 mb-3 uppercase tracking-wider font-mono">
            Active Bookings Status
          </h3>
          <div className="space-y-3">
            {ongoingBookings.map(req => {
              const statusColors = {
                Requested: "text-amber-500 bg-amber-50 border-amber-100",
                Assigned: "text-blue-500 bg-blue-50 border-blue-100",
                "In Progress": "text-orange-500 bg-orange-50 border-orange-100",
                Completed: "text-emerald-500 bg-emerald-50 border-emerald-100",
                Cancelled: "text-neutral-400 bg-neutral-50 border-neutral-100"
              };

              const getProgressPercentage = (status: string) => {
                if (status === "Requested") return 25;
                if (status === "Assigned") return 50;
                if (status === "In Progress") return 75;
                return 100;
              };

              return (
                <div key={req.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200/30">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800">{req.staffName}</h4>
                      <p className="text-[10px] text-neutral-500">{req.category} Directory</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 font-bold rounded-full uppercase font-mono border ${statusColors[req.status] || ""}`}>
                      {req.status}
                    </span>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500">
                      <span>Service Timeline Tracker</span>
                      <span className="font-semibold text-neutral-800 font-mono">{getProgressPercentage(req.status)}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressPercentage(req.status)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-brand-emerald h-full rounded-full"
                      />
                    </div>
                    {req.status === "Requested" && (
                      <p className="text-[9.5px] text-neutral-400 italic">Finding nearest local staff technician at the gates...</p>
                    )}
                    {req.status === "Assigned" && (
                      <p className="text-[9.5px] text-amber-600 font-medium">Technician assigned and heading to basement corridors.</p>
                    )}
                    {req.status === "In Progress" && (
                      <p className="text-[9.5px] text-brand-emerald animate-pulse font-medium">Technician on-site. Work currently in progress.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Announcements Board Container */}
      <div className="bg-white rounded-2xl p-4.5 border border-neutral-100 shadow-sm relative">
        <h3 className="font-display font-semibold text-xs text-neutral-700 uppercase tracking-wider font-mono mb-3.5 flex items-center gap-1.5">
          <Megaphone className="w-4 h-4 text-brand-emerald" />
          General Announcements
        </h3>

        <div className="space-y-3.5">
          {announcements.slice(0, 2).map((ann) => (
            <div 
              key={ann.id} 
              className="group border-l-2 p-1.5 pl-3 transition-colors text-xs space-y-1 block relative ${
                ann.priority === 'High' ? 'border-rose-500' : 'border-emerald-600'
              }"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-mono font-medium">
                  {formatTime(ann.date)}
                </span>
                {ann.priority === "High" && (
                  <span className="text-[8.5px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-600 font-bold">
                    Important
                  </span>
                )}
              </div>
              <h4 className="font-bold text-neutral-800 font-display group-hover:text-brand-emerald transition-colors">{ann.title}</h4>
              <p className="text-neutral-500 text-[11px] leading-relaxed line-clamp-2">
                {ann.content}
              </p>
              <p className="text-[9.5px] text-neutral-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-neutral-300" /> Issued by: {ann.sender}
              </p>
            </div>
          ))}
        </div>
        
        {announcements.length > 2 && (
          <div className="text-center pt-2.5 mt-1 border-t border-neutral-100">
            <button
              onClick={() => alert("Announcements lists will show fully inside noticeboard module of Greenwood Heights!")}
              className="text-xs text-brand-emerald hover:text-emerald-800 transition-colors font-semibold inline-flex items-center gap-1"
            >
              View Noticeboard Archive <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Society Rules Preview Card */}
      <div className="bg-amber-50/40 border-2 border-amber-500/20 rounded-2xl p-4 shadow-sm flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-display font-bold text-xs text-amber-900">Society Highlights Reminder</h4>
          <div className="mt-1.5 space-y-1 text-[11px] text-amber-900/80 leading-relaxed font-sans">
            {renderRulesReminders()}
          </div>
          <button
            onClick={() => onNavigateTab("rulebook")}
            className="text-[10px] text-amber-700 bg-amber-100/50 group hover:bg-amber-100 border border-amber-500/10 hover:border-amber-500/30 font-bold px-2.5 py-1 rounded-lg mt-3.5 inline-flex items-center gap-1.5 transition-colors"
          >
            Ask Questions to Rulebook AI
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
