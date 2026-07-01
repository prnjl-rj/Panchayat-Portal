import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  CreditCard, 
  User, 
  Users, 
  Check, 
  Plus, 
  Trash2, 
  Building2, 
  Calendar, 
  Hash, 
  HeartPulse, 
  LogOut, 
  QrCode, 
  Sparkles,
  MapPin,
  Smartphone
} from "lucide-react";
import { AppUser, Society } from "../types";

interface UserProfileModalProps {
  currentUser: AppUser;
  selectedSociety: Society | null;
  onClose: () => void;
  onUpdateProfile?: (updatedUser: AppUser) => void;
  onLogout: () => void;
}

export default function UserProfileModal({ 
  currentUser, 
  selectedSociety, 
  onClose, 
  onUpdateProfile, 
  onLogout 
}: UserProfileModalProps) {
  
  const [newFamilyMember, setNewFamilyMember] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const familyList = currentUser.familyMembers || [];

  // Expiration calculation
  const expiresAtDate = new Date(currentUser.subscriptionExpiresAt);
  const daysRemaining = Math.max(0, Math.ceil((expiresAtDate.getTime() - Date.now()) / (24 * 3600 * 1000)));

  // Subscription plan info helper
  const getPlanBadge = (type: string) => {
    switch (type) {
      case "Free":
        return { name: "7-Day Complimentary Trial", color: "bg-neutral-100 text-neutral-800 border-neutral-300" };
      case "1Month":
        return { name: "Bronze 1-Month Premium", color: "bg-amber-100 text-amber-900 border-amber-300" };
      case "4Months":
        return { name: "Silver 4-Month Economy", color: "bg-indigo-100 text-indigo-900 border-indigo-300" };
      case "1Year":
        return { name: "Gold 1-Year Ultimate", color: "bg-emerald-100 text-emerald-900 border-emerald-300" };
      default:
        return { name: "No Active Subscription", color: "bg-red-100 text-red-900 border-red-300" };
    }
  };

  const planInfo = getPlanBadge(currentUser.subscriptionType);

  // Dynamic QR data for digital Resident gate pass
  const gatePassQrData = `PAN_RES_ID:${currentUser.id}|SOC:${currentUser.societyId}|NAME:${currentUser.name}|FLAT:${currentUser.flatNumber}|EXP:${currentUser.subscriptionExpiresAt}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(gatePassQrData)}`;

  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      setIsUpdating(true);
      try {
        const response = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email,
            profilePictureUrl: base64String
          })
        });
        const data = await response.json();
        if (response.ok && data.user) {
          if (onUpdateProfile) onUpdateProfile(data.user);
          setSuccessMsg("Profile picture updated!");
          setTimeout(() => setSuccessMsg(""), 2000);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUpdating(false);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Save updated family member list
  const handleAddFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyMember.trim()) return;

    setIsUpdating(true);
    const updatedFamily = [...familyList, newFamilyMember.trim()];

    try {
      const response = await fetch("/api/auth/renew-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          societyId: currentUser.societyId,
          renewedType: currentUser.subscriptionType, // preserve same plan
          familyMembers: updatedFamily
        })
      });

      const data = await response.json();
      if (response.ok && data.user) {
        if (onUpdateProfile) {
          onUpdateProfile(data.user);
        }
        setNewFamilyMember("");
        setSuccessMsg("Family database synchronized!");
        setTimeout(() => setSuccessMsg(""), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove a family member from list
  const handleRemoveFamilyMember = async (indexToRemove: number) => {
    setIsUpdating(true);
    const updatedFamily = familyList.filter((_, idx) => idx !== indexToRemove);

    try {
      const response = await fetch("/api/auth/renew-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          societyId: currentUser.societyId,
          renewedType: currentUser.subscriptionType,
          familyMembers: updatedFamily
        })
      });

      const data = await response.json();
      if (response.ok && data.user) {
        if (onUpdateProfile) {
          onUpdateProfile(data.user);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpgradeSubscription = async () => {
    setIsUpgrading(true);
    try {
      // Mock gateway success and 1 Year upgrade
      const response = await fetch("/api/auth/renew-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          societyId: currentUser.societyId,
          renewedType: "1Year",
          familyMembers: currentUser.familyMembers || []
        })
      });
      const data = await response.json();
      if (response.ok && data.user) {
        if (onUpdateProfile) onUpdateProfile(data.user);
        setSuccessMsg("Subscription Upgraded!");
        setTimeout(() => setSuccessMsg(""), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col font-sans"
      >
        {/* Head Bar */}
        <div className="bg-neutral-50 border-b border-neutral-150 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <User className="w-5 h-5 text-brand-emerald" />
            <h2 className="font-display font-extrabold text-sm text-neutral-800 uppercase tracking-wide">
              Resident Profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            className="p-1.5 hover:bg-neutral-200 active:bg-neutral-300 rounded-xl transition-colors cursor-pointer text-neutral-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Scrolling Space */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
          
          {/* DIGITAL RESIDENT SMART SECURITY PASS CARD */}
          <div className="bg-neutral-900 text-white rounded-2xl border border-neutral-800 p-4.5 relative overflow-hidden shadow-lg select-all">
            {/* Holographic background decoration */}
            <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-[-20px] bottom-[-20px] w-40 h-40 bg-zinc-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-display font-extrabold text-[11px] uppercase tracking-wider text-amber-300">
                    {selectedSociety?.name || "Greenwood Heights"}
                  </h3>
                  <p className="text-[7.5px] text-neutral-400 font-mono">PANCHAYAT VERIFIED MEMBER</p>
                </div>
              </div>
              <span className="font-mono text-[8px] tracking-widest bg-emerald-950 text-brand-emerald px-1.5 py-0.5 rounded border border-emerald-900 uppercase font-black">
                ACTIVE PASS
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Photo placeholder / avatar */}
              <div className="w-13 h-13 rounded-xl bg-neutral-850 flex items-center justify-center border border-neutral-700/80 shadow-inner text-2xl relative overflow-hidden">
                {currentUser.profilePictureUrl ? (
                  <img src={currentUser.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  "👤"
                )}
                <label htmlFor="profile-picture-upload" className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                   <input id="profile-picture-upload" type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} disabled={isUpdating} aria-label="Upload profile picture" />
                   <Plus className="w-5 h-5 text-white" />
                </label>
                <div className="absolute bottom-[-1.5px] right-[-1.5px] w-3 h-3 bg-brand-emerald rounded-full border-2 border-neutral-900" title="System verified online status" />
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <h4 className="font-extrabold text-sm truncate text-white uppercase tracking-wide leading-tight">
                  {currentUser.name}
                </h4>
                <p className="text-[10.5px] text-neutral-400 font-mono flex items-center gap-0.5">
                  <Hash className="w-3 h-3 text-brand-emerald shrink-0" />
                  Flat: <span className="text-white font-bold">{currentUser.flatNumber}</span>
                </p>
                <p className="text-[9px] text-neutral-400">
                  Ref ID: <span className="font-mono font-bold text-neutral-300">{currentUser.id.toUpperCase()}</span>
                </p>
              </div>

              {/* Dynamic QR Code */}
              <div className="p-1 bg-white rounded-lg shrink-0">
                <img 
                  src={qrCodeUrl} 
                  alt="Dynamic Pass" 
                  className="w-11 h-11"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="mt-3.5 pt-2 border-t border-neutral-800 flex justify-between text-[8px] font-mono uppercase tracking-widest text-neutral-400 text-left">
              <div>
                <span>Phone Ref</span>
                <span className="block text-[8.5px] text-white font-bold mt-0.5">{currentUser.phone || "N/A"}</span>
              </div>
              <div className="text-right">
                <span>Identity Certified</span>
                <span className="block text-[8.5px] text-brand-emerald font-bold mt-0.5">SHA-256 SECURE</span>
              </div>
            </div>
          </div>

          {/* ACTIVE SUBSCRIPTION METER */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200/70 p-4 space-y-2.5">
            <span className="text-[9.5px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-brand-emerald" /> Subscription & Validity Status
            </span>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${planInfo.color}`}>
              <div>
                <p className="font-bold text-xs">{planInfo.name}</p>
                <p className="text-[10px] mt-0.5 opacity-80 leading-snug">
                  Expires: {new Date(currentUser.subscriptionExpiresAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="block font-mono font-black text-sm">{daysRemaining}</span>
                <span className="text-[8.5px] block font-mono uppercase tracking-wider">Days left</span>
              </div>
            </div>

            {/* Exp countdown bar indicator */}
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${daysRemaining > 5 ? "bg-brand-emerald animate-pulse" : "bg-red-500"}`}
                style={{ width: `${Math.min(100, (daysRemaining / 365) * 100)}%` }}
              />
            </div>
            {currentUser.subscriptionType !== "1Year" && (
              <button
                onClick={handleUpgradeSubscription}
                disabled={isUpgrading}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 transition-colors flex items-center justify-center gap-1.5"
              >
                {isUpgrading ? "Processing..." : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade Subscription Plan
                  </>
                )}
              </button>
            )}
          </div>

          {/* DETAILED RESIDENT META-INFO GRID */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/70 space-y-3">
            <span className="text-[9.5px] font-black uppercase text-neutral-500 tracking-wider block">
              📋 Demographics & Address Registry
            </span>

            <div className="grid grid-cols-2 gap-3.5 text-left text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-0.5">
                  <Building2 className="w-3 h-3 text-neutral-400" /> Cooperative Society
                </span>
                <span className="font-bold text-neutral-800 block text-[11px] truncate">
                  {selectedSociety?.name || "Greenwood Enclave"}
                </span>
                <span className="text-[9.5px] text-neutral-400 block truncate">
                  {selectedSociety?.address}, {selectedSociety?.city}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-neutral-400" /> Unit Address
                </span>
                <span className="font-bold text-neutral-800 block text-[11px]">
                  Flat Number {currentUser.flatNumber}
                </span>
                <span className="text-[9.5px] text-neutral-400 block">
                  Registered Resident Node
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-0.5">
                  👤 Age & Gender
                </span>
                <span className="font-bold text-neutral-800 block text-[11px]">
                  {currentUser.age ? `${currentUser.age} Years Old` : "Not Configured"}
                </span>
                <span className="text-[9.5px] text-neutral-400 block">
                  Gender Node: {currentUser.gender || "Not Set"}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-0.5">
                  <Smartphone className="w-3 h-3 text-neutral-400" /> Login Reference
                </span>
                <span className="font-bold text-neutral-800 block text-[11px] truncate" title={currentUser.email}>
                  {currentUser.email}
                </span>
                <span className="text-[9.5px] text-neutral-400 block">
                  Authorized Sign-in email
                </span>
              </div>
            </div>
          </div>

          {/* FAMILY MEMBERS / CO-RESIDENTS STACK */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1">
                <Users className="w-4 h-4 text-brand-emerald" /> Co-Residents / Family ({familyList.length})
              </span>
              
              {successMsg && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-pulse">
                  {successMsg}
                </span>
              )}
            </div>

            {/* List tags */}
            {familyList.length === 0 ? (
              <p className="text-[10.5px] text-neutral-400 italic text-left pt-1">
                No co-residents listed on this security block. Add family members below to authorize their digital entrance logs.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {familyList.map((member, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-250 rounded-full text-[10.5px] text-neutral-700 shadow-3xs"
                  >
                    <span>{member}</span>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleRemoveFamilyMember(idx)}
                      className="p-0.5 text-neutral-400 hover:text-red-500 rounded-full cursor-pointer hover:bg-neutral-100 transition-all shrink-0"
                      title={`Remove ${member}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Form to append new member */}
            <form onSubmit={handleAddFamilyMember} className="flex gap-2 pt-2 border-t border-neutral-200">
              <input
                type="text"
                placeholder="Name of family member..."
                value={newFamilyMember}
                onChange={e => setNewFamilyMember(e.target.value)}
                disabled={isUpdating}
                className="flex-1 bg-white border border-neutral-250 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-brand-emerald text-neutral-700"
              />
              <button
                type="submit"
                disabled={isUpdating || !newFamilyMember.trim()}
                className="bg-brand-emerald hover:bg-emerald-700 text-white font-bold p-2 px-3.5 rounded-xl transition-colors shrink-0 text-xs flex items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" /> ADD
              </button>
            </form>
          </div>

        </div>

        {/* Foot and action drawers */}
        <div className="bg-neutral-50 px-5 py-4 border-t border-neutral-150 flex items-center justify-between shrink-0">
          {confirmingLogout ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors active:scale-95 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Confirm Logout
              </button>
              <button
                onClick={() => setConfirmingLogout(false)}
                className="px-2.5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-xs rounded-xl transition-colors active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingLogout(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold text-xs rounded-xl transition-colors active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Log out of Profile
            </button>
          )}

          <span className="text-[10px] text-neutral-400 font-mono">
            Panchayat v1.8.4
          </span>
        </div>
      </motion.div>
    </div>
  );
}
