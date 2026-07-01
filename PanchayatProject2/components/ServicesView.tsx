import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Clock, 
  Wrench, 
  Calendar, 
  Star, 
  BadgeCheck, 
  CalendarCheck2, 
  PhoneCall, 
  Zap, 
  X, 
  AlertCircle,
  Truck,
  Sparkles,
  CreditCard,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  ListFilter,
  History,
  Lock,
  Download
} from "lucide-react";
import { ServiceStaff, ServiceRequest, Transaction } from "../types";
import PaymentGatewayModal from "./PaymentGatewayModal";

interface ServicesViewProps {
  staffList: ServiceStaff[];
  activeRequests: ServiceRequest[];
  transactionHistory: Transaction[];
  onBookStaff: (staffId: string, flatNumber: string, timeSlot: string, notes?: string) => Promise<void>;
  onPaySuccess: (requestId: string, paymentMethod: 'UPI' | 'Card' | 'NetBanking', amount: number) => Promise<void>;
}

export default function ServicesView({
  staffList,
  activeRequests,
  transactionHistory,
  onBookStaff,
  onPaySuccess
}: ServicesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [servicesSubTab, setServicesSubTab] = useState<'directory' | 'history'>('directory');
  const [bookingStaff, setBookingStaff] = useState<ServiceStaff | null>(null);
  
  // Outstanding payment checkout targets
  const [payTargetRequest, setPayTargetRequest] = useState<ServiceRequest | null>(null);

  // Local active form entries
  const [userFlat, setUserFlat] = useState("Tower B - 402");
  const [selectedSlot, setSelectedSlot] = useState("Today, 4:00 PM - 6:00 PM");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories list
  const categories = ["All", "Plumber", "Electrician", "Laundry", "Housekeeping", "Car Wash", "Pest Control"];
  
  const slotsList = [
    "Today, 4:00 PM - 6:00 PM",
    "Tomorrow, 9:00 AM - 11:00 AM",
    "Tomorrow, 11:00 AM - 1:00 PM",
    "Tomorrow, 3:00 PM - 5:00 PM",
    "Wednesday, 10:00 AM - 12:00 PM"
  ];

  // Filtering
  const filteredStaffList = selectedCategory === "All" 
    ? staffList 
    : staffList.filter(s => s.category === selectedCategory);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingStaff) return;
    
    setIsSubmitting(true);
    try {
      await onBookStaff(bookingStaff.id, userFlat, selectedSlot, bookingNotes);
      setBookingStaff(null);
      setBookingNotes("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabelText = (status: string) => {
    switch (status) {
      case "Requested": return "Awaiting Guard dispatch";
      case "Assigned": return "En-route to flat";
      case "In Progress": return "Work in execution";
      case "Completed": return "Service job complete";
      default: return "Booking cancelled";
    }
  };

  const statusProgressSteps = (status: string) => {
    const states = ["Requested", "Assigned", "In Progress", "Completed"];
    const activeIndex = states.indexOf(status);
    return activeIndex;
  };

  return (
    <div className="space-y-4 pb-8 relative h-full flex flex-col">
      {/* Tab Header Banner */}
      <div className="text-center space-y-1.5 shrink-0">
        <h2 className="font-display font-bold text-base text-neutral-800">Amenities & Services Desk</h2>
        <p className="text-[11px] text-neutral-500 max-w-[300px] mx-auto leading-relaxed">
          Instantly connect with verified society plumbers, laundry shops, or pay for active and historical apartment utility bills.
        </p>
      </div>

      {/* Subtab Toggle Selector: Helper directory vs Ledger History */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl shrink-0">
        <button
          onClick={() => setServicesSubTab('directory')}
          className={`py-1.5 rounded-lg text-[10px] font-sans font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            servicesSubTab === 'directory' 
              ? "bg-white text-indigo-900 shadow-sm" 
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> Book Resident Helpers
        </button>
        <button
          onClick={() => setServicesSubTab('history')}
          className={`py-1.5 rounded-lg text-[10px] font-sans font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            servicesSubTab === 'history' 
              ? "bg-white text-indigo-900 shadow-sm" 
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <History className="w-3.5 h-3.5" /> Payment History ({transactionHistory.length})
        </button>
      </div>

      {/* RENDER VIEW: DIRECTORY */}
      {servicesSubTab === 'directory' && (
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pt-1 min-h-0">
          
          {/* Categories filters scroll list */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg border text-[10px] font-semibold tracking-wide transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-brand-emerald text-white border-brand-emerald"
                    : "bg-white text-neutral-600 border-neutral-100 hover:border-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Staff Directories */}
          <div className="space-y-3">
            {filteredStaffList.map(item => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm flex items-start justify-between gap-3 hover:shadow-md transition-all"
              >
                {/* Left Content Column */}
                <div className="flex items-start gap-3">
                  {/* Profile Image with Availability Dot */}
                  <div className="relative">
                    <img 
                      src={item.avatar} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded-xl border border-neutral-100"
                      referrerPolicy="no-referrer"
                    />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      item.isAvailable ? "bg-emerald-500" : "bg-neutral-300"
                    }`} />
                  </div>

                  {/* Text metadata */}
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-neutral-800 font-display">{item.name}</h4>
                      {item.rating >= 4.8 && (
                        <BadgeCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-100 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono tracking-wide uppercase mt-0.5">
                      {item.category} helper
                    </p>
                    
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold text-neutral-700">{item.rating}</span>
                      <span className="text-neutral-300 text-[10px]">|</span>
                      <span className="text-[11px] font-semibold text-indigo-700 font-mono">{item.baseCharge}</span>
                    </div>
                  </div>
                </div>

                {/* Right Book Trigger Column */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-wide ${
                    item.isAvailable 
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                      : "bg-neutral-50 text-neutral-400 border border-neutral-100"
                  }`}>
                    {item.isAvailable ? "AVAILABLE" : "BUSY"}
                  </span>

                  <button
                    onClick={() => {
                      setBookingStaff(item);
                      // Pre-populate approximate amount in target request details if needed
                    }}
                    className="mt-2 text-[10px] font-bold text-brand-emerald bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                  >
                    SELECT
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Live Booking Updates Section */}
          {activeRequests.length > 0 && (
            <div className="space-y-3 pt-3">
              <h3 className="font-display font-semibold text-xs text-neutral-700 uppercase tracking-wider font-mono">
                Active Job Progress Timelines
              </h3>

              <div className="space-y-4">
                {activeRequests.map(req => {
                  const currentStep = statusProgressSteps(req.status);
                  const isCompleted = req.status === "Completed";
                  const isCancelled = req.status === "Cancelled";

                  return (
                    <div 
                      key={req.id}
                      className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-50">
                        <div>
                          <h4 className="text-xs font-bold text-neutral-800 font-display">{req.staffName}</h4>
                          <p className="text-[9.5px] text-neutral-400 font-mono uppercase tracking-wide">
                            {req.category} Booking
                          </p>
                        </div>
                        <div>
                          <span className={`text-[10px] uppercase font-mono tracking-wide px-2 py-0.5 rounded font-bold ${
                            isCompleted ? "bg-indigo-100 text-indigo-800" : "bg-brand-emerald text-amber-300"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>

                      {/* Schedule Details */}
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div className="space-y-0.5">
                          <span className="text-neutral-400 font-mono text-[9px] uppercase">Service Slot</span>
                          <p className="font-semibold text-neutral-700 flex items-center gap-1">
                            <Clock className="w-3 text-brand-emerald shrink-0" />
                            {req.timeSlot}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-neutral-400 font-mono text-[9px] uppercase">Delivery Flat</span>
                          <p className="font-semibold text-neutral-700">
                            {req.flatNumber}
                          </p>
                        </div>
                      </div>

                      {/* Progress Step Nodes */}
                      {!isCancelled && (
                        <div className="space-y-2.5 pt-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 uppercase font-mono">Live Stage Tracker</span>
                            <span className="text-[10.5px] font-semibold text-brand-emerald flex items-center gap-1 font-sans">
                              {getStatusLabelText(req.status)}
                            </span>
                          </div>

                          {/* Timeline graphic bar */}
                          <div className="flex items-center justify-between relative px-2">
                            {/* Progress lines behind */}
                            <div className="absolute top-1/2 left-4 right-4 h-1 bg-neutral-100 -translate-y-1/2 -z-10" />
                            <div 
                              className="absolute top-1/2 left-4 h-1 bg-brand-emerald -translate-y-1/2 -z-10 transition-all duration-300" 
                              style={{ width: `${(currentStep / 3) * (100 - 8)}%` }}
                            />

                            {/* Step Dots */}
                            {["Requested", "Assigned", "In Progress", "Completed"].map((st, idx) => {
                              const isActive = idx <= currentStep;
                              const isCurrent = idx === currentStep;

                              return (
                                <div key={st} className="flex flex-col items-center gap-1 z-10">
                                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isCurrent 
                                      ? "bg-amber-300 text-brand-emerald border-brand-emerald scale-110" 
                                      : isActive
                                      ? "bg-brand-emerald border-brand-emerald text-white"
                                      : "bg-white border-neutral-200 text-neutral-400"
                                  }`}>
                                    {isActive && idx < currentStep ? (
                                      <span className="text-[7.5px] leading-none">✓</span>
                                    ) : (
                                      <span className="text-[7.5px] font-bold font-mono">{idx + 1}</span>
                                    )}
                                  </span>
                                  <span className={`text-[8.5px] font-bold tracking-tight font-mono ${
                                    idx <= currentStep ? "text-brand-emerald" : "text-neutral-400"
                                  }`}>
                                    {st}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* SECURE PAYMENT LEDGER BAR */}
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-neutral-400 font-mono uppercase">Outstanding Bill</span>
                          <span className="text-xs font-bold text-neutral-700 font-mono">₹{req.amount || 199}</span>
                        </div>
                        
                        {req.paymentStatus === "Paid" ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 border border-emerald-100 rounded-lg flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> SECURED: PAID
                            </span>
                            <span className="text-[8.5px] text-neutral-400 font-mono mt-0.5">{req.transactionId}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPayTargetRequest(req)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 shrink-0" /> PAY OUTSTANDING
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW: SECURE PAYMENT HISTORY & LEDGER LIST */}
      {servicesSubTab === 'history' && (
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pt-1 min-h-0">
          
          {/* Security details bar */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase text-indigo-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Secure Payments Ledger
              </span>
              <span className="text-[9.5px] bg-slate-800 text-amber-400 font-mono font-bold px-1.5 py-0.5 rounded border border-slate-700">
                PCI-DSS COMPLETE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              All transactions executed are verified immediately by payment gateways. Official printable receipts and local estate vouchers are preserved inside the cooperative ledger.
            </p>
          </div>

          <div className="space-y-3">
            {transactionHistory.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-neutral-100 text-center flex flex-col items-center">
                <Receipt className="w-10 h-10 text-neutral-300 mb-2" />
                <p className="font-display font-medium text-neutral-600 text-xs">No entries in secure ledger</p>
                <p className="text-[11px] text-neutral-400 mt-0.5 max-w-[240px] leading-normal">
                  Settle some service requirements above to record official invoice statements.
                </p>
              </div>
            ) : (
              transactionHistory.map(txn => (
                <div 
                  key={txn.id}
                  className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 font-display flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                        {txn.staffName}
                      </h4>
                      <p className="text-[9.5px] text-neutral-400 font-mono uppercase tracking-wide mt-0.5">
                        {txn.category} Service Code Reference
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-neutral-800 font-mono block">₹{txn.amount}</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 font-mono border border-emerald-100 rounded uppercase tracking-wide">
                        SUCCESS
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-50/50 rounded-xl p-2.5 border border-neutral-100 text-[10px] font-mono text-neutral-500 grid grid-cols-2 gap-y-1.5 gap-x-2">
                    <div>
                      <span className="text-neutral-400 uppercase text-[8.5px]">Transaction ID</span>
                      <p className="font-semibold text-neutral-700">{txn.transactionId}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 uppercase text-[8.5px]">Payment Channel</span>
                      <p className="font-semibold text-neutral-700">{txn.paymentMethod}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 uppercase text-[8.5px]">Timestamp</span>
                      <p className="font-semibold text-neutral-700">
                        {new Date(txn.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-400 uppercase text-[8.5px]">Gateway Security</span>
                      <p className="font-semibold text-indigo-700">✓ SECURED</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button 
                      onClick={() => alert(`Pulling transaction document for ID: ${txn.transactionId}...`)}
                      className="text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 w-3" /> DOWNLOAD RECEIPT PDF
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Booking Sheet Modal Overlay */}
      <AnimatePresence>
        {bookingStaff && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingStaff(null)}
              className="absolute inset-0 bg-black z-40 rounded-[40px] pointer-events-auto"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 inset-x-0 bg-white border-t border-neutral-100 rounded-t-3xl shadow-2xl z-50 p-5 space-y-4 max-h-[85%] overflow-y-auto pointer-events-auto text-[#0f172a]"
            >
              <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h3 className="font-display font-semibold text-sm text-neutral-800">
                    Confirm Service Request
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingStaff(null)}
                  aria-label="Close booking modal"
                  className="p-1 bg-neutral-50 rounded-full text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Technician Profile Card Header */}
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100/50 flex gap-3">
                <img 
                  src={bookingStaff.avatar} 
                  alt={bookingStaff.name}
                  className="w-11 h-11 object-cover rounded-lg border" 
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-neutral-800 font-display">{bookingStaff.name}</h4>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    Verified {bookingStaff.category} Partner
                  </p>
                  <p className="text-[10.5px] font-bold text-indigo-800 mt-1 font-mono">
                    Fee: {bookingStaff.baseCharge}
                  </p>
                </div>
              </div>

              {/* Booking Form details */}
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs font-medium text-neutral-600">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Apartment / Flat Number
                  </label>
                  <input 
                    type="text" 
                    value={userFlat}
                    onChange={(e) => setUserFlat(e.target.value)}
                    placeholder="Enter apartment or flat number"
                    required
                    className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Select Convenient Timeslot
                  </label>
                  <select
                    title="Select a convenient timeslot"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium font-sans"
                  >
                    {slotsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Additional Instructions (Optional)
                  </label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="e.g., Please take stairs if the elevator B is undergoing service."
                    rows={2}
                    className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-brand-emerald text-white rounded-xl text-xs font-semibold hover:bg-indigo-800 transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Dispatching to guard...
                    </span>
                  ) : (
                    <>
                      <Zap className="fill-amber-300 w-4 h-4 text-amber-300 stroke-none" /> Book {bookingStaff.category} Now
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SECURE CHECKOUT PORTAL MODAL */}
      <PaymentGatewayModal
        isOpen={!!payTargetRequest}
        onClose={() => setPayTargetRequest(null)}
        request={payTargetRequest}
        onPaySuccess={onPaySuccess}
      />
    </div>
  );
}
