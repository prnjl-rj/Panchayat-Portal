import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Users, 
  Clock, 
  FileText, 
  Wrench,
  LogOut,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  Home,
  UserCheck,
  Calendar,
  Lock
} from "lucide-react";
import { AppUser, Society, ResidentRegistry } from "../types";

export default function OwnerDashboard({ 
  currentUser, 
  society, 
  onLogout,
  onUpdateSociety 
}: { 
  currentUser: AppUser;
  society: Society;
  onLogout: () => void;
  onUpdateSociety: (s: Society) => void;
}) {
  const [activeTab, setActiveTab] = useState<"settings" | "residents" | "facilities">("settings");

  // --- Dynamic Amenities State (Settings tab) ---
  const [rulesText, setRulesText] = useState(society.rulesText || "1. No loud music after 10 PM.\n2. Gym timings 6 AM - 9 PM.");
  const [amenities, setAmenities] = useState<{ name: string; timing: string }[]>(
    society.amenities || [
      { name: "Gymnasium", timing: "6:00 AM to 9:00 PM" },
      { name: "Swimming Pool", timing: "7:00 AM to 11:00 AM, 4:00 PM to 8:00 PM" }
    ]
  );
  const [newAmenityName, setNewAmenityName] = useState("");
  const [newAmenityTiming, setNewAmenityTiming] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const handleAddAmenity = () => {
    if (!newAmenityName.trim() || !newAmenityTiming.trim()) return;
    setAmenities(prev => [...prev, { name: newAmenityName.trim(), timing: newAmenityTiming.trim() }]);
    setNewAmenityName("");
    setNewAmenityTiming("");
  };

  const handleDeleteAmenity = (index: number) => {
    setAmenities(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateSociety({
        ...society,
        rulesText: rulesText,
        amenities: amenities
      });
      setIsSaving(false);
      setSavedMsg("Settings Updated!");
      setTimeout(() => setSavedMsg(""), 2000);
    }, 800);
  };

  // --- Residents Database State (Residents tab) ---
  const [residentsList, setResidentsList] = useState<ResidentRegistry[]>([]);
  const [isLoadingResidents, setIsLoadingResidents] = useState(false);
  const [residentError, setResidentError] = useState("");
  const [residentSuccess, setResidentSuccess] = useState("");
  const [residentIsSubmitting, setResidentIsSubmitting] = useState(false);

  // New Resident Form State
  const [resForm, setResForm] = useState({
    name: "",
    email: "",
    flatNumber: "",
    phone: "",
    password: "123", // Default suggested password
    age: "",
    gender: "Male"
  });

  const fetchResidents = async () => {
    setIsLoadingResidents(true);
    try {
      const res = await fetch("/api/residents", {
        headers: { "X-Society-Id": society.id }
      });
      if (res.ok) {
        const data = await res.json();
        setResidentsList(data);
      }
    } catch (err) {
      console.error("Failed to load residents database:", err);
    } finally {
      setIsLoadingResidents(false);
    }
  };

  const handleAddResidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resForm.name.trim() || !resForm.email.trim() || !resForm.flatNumber.trim() || !resForm.phone.trim()) {
      setResidentError("Name, Email, Flat Number, and Phone details are required.");
      return;
    }
    setResidentError("");
    setResidentSuccess("");
    setResidentIsSubmitting(true);

    try {
      const res = await fetch("/api/residents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Society-Id": society.id
        },
        body: JSON.stringify({
          name: resForm.name,
          email: resForm.email,
          flatNumber: resForm.flatNumber,
          phone: resForm.phone,
          password: resForm.password,
          age: resForm.age ? Number(resForm.age) : undefined,
          gender: resForm.gender
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResidentSuccess(`Successfully enrolled ${resForm.name} in flat ${resForm.flatNumber}!`);
        // Reset form to defaults
        setResForm({
          name: "",
          email: "",
          flatNumber: "",
          phone: "",
          password: "123",
          age: "",
          gender: "Male"
        });
        // Reload list
        fetchResidents();
      } else {
        setResidentError(data.error || "Failed to save resident database entry.");
      }
    } catch (err) {
      console.error("Error creating resident entry:", err);
      setResidentError("Server communication fault. Try again.");
    } finally {
      setResidentIsSubmitting(false);
    }
  };

  // --- Facilities State (Facilities tab) ---
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");
  const [staffIsSubmitting, setStaffIsSubmitting] = useState(false);

  // New Staff Form State
  const [staffForm, setStaffForm] = useState({
    name: "",
    category: "",
    phone: "",
    baseCharge: "₹150 / Visit"
  });

  const fetchStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const res = await fetch("/api/services/directory", {
        headers: { "X-Society-Id": society.id }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error("Failed to load staff roster:", err);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.phone.trim() || !staffForm.category.trim()) {
      setStaffError("Name, Category and Phone details are required to list service staff.");
      return;
    }
    setStaffError("");
    setStaffSuccess("");
    setStaffIsSubmitting(true);

    try {
      const res = await fetch("/api/services/directory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Society-Id": society.id
        },
        body: JSON.stringify(staffForm)
      });
      const data = await res.json();
      if (res.ok) {
        setStaffSuccess(`Listed ${staffForm.name} as a verified ${staffForm.category}!`);
        setStaffForm({
          name: "",
          category: "",
          phone: "",
          baseCharge: "₹150 / Visit"
        });
        // Reload list
        fetchStaff();
      } else {
        setStaffError(data.error || "Failed to list staff.");
      }
    } catch (err) {
      console.error("Error listing staff:", err);
      setStaffError("Connection failure.");
    } finally {
      setStaffIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      const res = await fetch(`/api/services/directory/${staffId}`, {
        method: "DELETE",
        headers: {
          "X-Society-Id": society.id
        }
      });
      if (res.ok) {
        fetchStaff();
      } else {
        console.error("Failed to delete staff");
      }
    } catch (err) {
      console.error("Error deleting staff:", err);
    }
  };

  // Fetch lists on Tab mount or Tab changes
  useEffect(() => {
    if (activeTab === "residents") {
      fetchResidents();
    } else if (activeTab === "facilities") {
      fetchStaff();
    }
  }, [activeTab, society.id]);

  return (
    <div className="flex-1 bg-neutral-50 flex flex-col h-full overflow-hidden">
      {/* Admin Branding Header */}
      <div className="bg-white px-5 pt-12 pb-4 shadow-xs z-10 shrink-0 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-sm text-neutral-900 tracking-tight leading-none uppercase">
                {society.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">Caretaker Control Room</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] font-extrabold text-neutral-800 leading-none">{currentUser.name}</p>
              <p className="text-[9.5px] text-neutral-400 mt-0.5 font-medium">Administrator</p>
            </div>
            {confirmingLogout ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={onLogout}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setConfirmingLogout(false)}
                  className="px-2.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setConfirmingLogout(true)}
                title="Logout from dashboard"
                className="p-2 text-neutral-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-6 p-1 bg-neutral-100 border border-neutral-200/50 rounded-xl overflow-x-auto no-scrollbar">
          {(["settings", "residents", "facilities"] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 min-w-[100px] text-[11px] font-bold py-2 rounded-lg transition-all text-center capitalize cursor-pointer ${
                activeTab === t 
                  ? "bg-white text-orange-600 shadow-xs border border-neutral-200" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* 1. SETTINGS APP (Rulebook & Custom Amenities Hours) */}
        {activeTab === "settings" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-left"
          >
            {/* Rulebook Textbox */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200">
              <h3 className="text-[11px] font-extrabold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5 mb-3 border-b border-neutral-100 pb-2">
                <FileText className="w-4 h-4 text-orange-500" /> Society Official Rules & Guidelines
              </h3>
              <p className="text-[10.5px] text-neutral-400 mb-2">This handbook is fed directly to the Gemini AI resident consultant for instant queries answering.</p>
              <textarea
                value={rulesText}
                onChange={e => setRulesText(e.target.value)}
                className="w-full h-36 bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-mono leading-relaxed"
                placeholder="Enter rules e.g.:\n1. Gym open 6 AM - 10 PM.\n2. Quiet hours 10 PM onwards."
              />
            </div>

            {/* Dynamic Amenities Hours Editor */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200">
              <h3 className="text-[11px] font-extrabold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5 mb-3 border-b border-neutral-100 pb-2">
                <Clock className="w-4 h-4 text-orange-500" /> Amenities Timings Manager
              </h3>
              
              <div className="space-y-2 mb-4">
                <p className="text-[10.5px] text-neutral-400">Current active facilities and their schedules displayed to residents:</p>
                <div className="grid grid-cols-1 gap-2">
                  {amenities.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200/60"
                    >
                      <div>
                        <p className="font-bold text-xs text-neutral-800">{item.name}</p>
                        <p className="text-[10px] text-orange-600 font-bold mt-0.5 tracking-wider uppercase font-mono">{item.timing}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteAmenity(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        title="Delete facility timing slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {amenities.length === 0 && (
                    <p className="text-xs text-neutral-400 italic text-center py-2">No facilities timed. Residents cannot view any amenity schedules.</p>
                  )}
                </div>
              </div>

              {/* Add Amenity Form */}
              <div className="p-3 bg-orange-50/40 rounded-xl border border-orange-100 space-y-2">
                <p className="text-[10px] font-extrabold text-orange-800 uppercase tracking-wider flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add New Amenity Schedule
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newAmenityName}
                    onChange={e => setNewAmenityName(e.target.value)}
                    placeholder="e.g. Swimming Pool, Tennis Court"
                    className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                  <input
                    type="text"
                    value={newAmenityTiming}
                    onChange={e => setNewAmenityTiming(e.target.value)}
                    placeholder="e.g. 6 AM - 11 AM, 4 PM - 9 PM"
                    className="bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleAddAmenity}
                  className="w-full py-1.5 bg-orange-600 text-white font-bold text-[10.5px] rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
                >
                  Confirm & List Amenity
                </button>
              </div>
            </div>

            {/* Master Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full py-3 bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-sm hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  {savedMsg ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {savedMsg || "Save Changes & Publish to App"}
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* 2. RESIDENTS DATABASE APP */}
        {activeTab === "residents" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-left"
          >
            {/* Enrollment Form */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200">
              <h3 className="text-[11px] font-extrabold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5 mb-3 border-b border-neutral-100 pb-2">
                <Users className="w-4 h-4 text-orange-500" /> Enroll New Resident Database Record
              </h3>

              {residentError && (
                <div className="mb-3 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                  <p className="font-semibold">{residentError}</p>
                </div>
              )}

              {residentSuccess && (
                <div className="mb-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
                  <p>{residentSuccess}</p>
                </div>
              )}

              <form onSubmit={handleAddResidentSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">Resident Full Name *</label>
                    <input
                      type="text"
                      required
                      value={resForm.name}
                      onChange={e => setResForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">Email Address (Login ID) *</label>
                    <input
                      type="email"
                      required
                      value={resForm.email}
                      onChange={e => setResForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. ramesh@gmail.com"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">Flat / Villa No *</label>
                    <input
                      type="text"
                      required
                      value={resForm.flatNumber}
                      onChange={e => setResForm(prev => ({ ...prev, flatNumber: e.target.value }))}
                      placeholder="e.g. Tower C - 504"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">WhatsApp Phone Contact *</label>
                    <input
                      type="text"
                      required
                      value={resForm.phone}
                      onChange={e => setResForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. +91 99911 XXXXX"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">Account Password *</label>
                    <input
                      type="text"
                      required
                      value={resForm.password}
                      onChange={e => setResForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Assign temporary password"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">Age (Optional)</label>
                    <input
                      type="number"
                      value={resForm.age}
                      onChange={e => setResForm(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="e.g. 34"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">Gender</label>
                    <select
                      title="Gender selection"
                      value={resForm.gender}
                      onChange={e => setResForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium cursor-pointer"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={residentIsSubmitting}
                  className="w-full py-2.5 bg-orange-600 text-white font-extrabold text-xs rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {residentIsSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <UserCheck className="w-4 h-4" />}
                  Register Resident & Sync Database
                </button>
              </form>
            </div>

            {/* Resident Directory List */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                <h3 className="text-[11px] font-extrabold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" /> Society Resident Directory ({residentsList.length})
                </h3>
                <button 
                  onClick={fetchResidents} 
                  className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Refresh list
                </button>
              </div>

              {isLoadingResidents ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <p className="text-[11.5px] text-neutral-400 font-medium">Querying society database ledger...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {residentsList.map((res, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 flex flex-col justify-between space-y-2 relative hover:bg-orange-50/10 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-extrabold text-xs text-neutral-800 flex items-center gap-1">
                              {res.name}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-bold tracking-wide flex items-center gap-1 mt-0.5">
                              <Home className="w-3 h-3 text-neutral-400 shrink-0" /> {res.flatNumber}
                            </p>
                          </div>
                          <span className="bg-orange-100 text-orange-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                            Verified
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 pt-2 border-t border-neutral-200/50 text-[10.5px] text-neutral-600">
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> <span className="truncate">{res.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> {res.phone}
                          </p>
                          <p className="flex items-center gap-1.5 font-mono text-[9px] text-neutral-500 font-bold bg-neutral-200/50 px-1.5 py-0.5 rounded-md inline-block mt-1">
                            <Lock className="w-3 h-3 text-neutral-500 inline mr-1" /> Password: <span className="text-orange-700">{res.password || "123"}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {residentsList.length === 0 && (
                    <div className="col-span-full text-center py-6">
                      <p className="text-xs text-neutral-400 italic">No resident ledger records loaded yet. Create records above!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. FACILITIES & DIRECTORY APP */}
        {activeTab === "facilities" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-left"
          >
            {/* Add Staff form */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200">
              <h3 className="text-[11px] font-extrabold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5 mb-3 border-b border-neutral-100 pb-2">
                <Plus className="w-4 h-4 text-orange-500" /> Register Verified Service Staff Member
              </h3>

              {staffError && (
                <div className="mb-3 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                  <p className="font-semibold">{staffError}</p>
                </div>
              )}

              {staffSuccess && (
                <div className="mb-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
                  <p>{staffSuccess}</p>
                </div>
              )}

              <form onSubmit={handleAddStaffSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">Staff Name *</label>
                    <input
                      type="text"
                      required
                      value={staffForm.name}
                      onChange={e => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Ramesh Singh (Electrician)"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">Profession Category *</label>
                    <input
                      type="text"
                      required
                      value={staffForm.category}
                      onChange={e => setStaffForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g. Electrician, Gardener"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">WhatsApp Phone Contact *</label>
                    <input
                      type="text"
                      required
                      value={staffForm.phone}
                      onChange={e => setStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. +91 91234 XXXXX"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-extrabold text-neutral-500 uppercase tracking-wider">Standard Base Charge (Fees)</label>
                    <input
                      type="text"
                      value={staffForm.baseCharge}
                      onChange={e => setStaffForm(prev => ({ ...prev, baseCharge: e.target.value }))}
                      placeholder="e.g. ₹150 / Visit"
                      className="w-full mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={staffIsSubmitting}
                  className="w-full py-2.5 bg-orange-600 text-white font-extrabold text-xs rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {staffIsSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Wrench className="w-4 h-4" />}
                  Register & Publish Staff Contact
                </button>
              </form>
            </div>

            {/* Staff Directory */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                <h3 className="text-[11px] font-extrabold text-neutral-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-orange-500" /> Active Roster Directory ({staffList.length})
                </h3>
                <button 
                  onClick={fetchStaff} 
                  className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Refresh list
                </button>
              </div>

              {isLoadingStaff ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <p className="text-[11.5px] text-neutral-400 font-medium">Fetching verified staff registry...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {staffList.map((st, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-white rounded-2xl border border-neutral-200/60 flex items-start gap-4 h-full shadow-sm"
                    >
                      <img 
                        src={st.avatar} 
                        alt={st.name} 
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-neutral-800 truncate">{st.name}</p>
                        <p className="text-[9px] text-orange-600 font-extrabold tracking-wider uppercase font-mono mt-0.5">{st.category}</p>
                        <p className="text-[10px] text-neutral-500 mt-1.5 flex items-center gap-1 font-semibold">
                          <Phone className="w-3 h-3 text-neutral-400 shrink-0" /> {st.phone}
                        </p>
                        <p className="text-[9.5px] text-neutral-400 font-semibold mt-0.5">Charge: {st.baseCharge}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteStaff(st.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete staff member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {staffList.length === 0 && (
                    <div className="col-span-full text-center py-6">
                      <p className="text-xs text-neutral-400 italic">No facility service staff registered yet. Add providers above!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
