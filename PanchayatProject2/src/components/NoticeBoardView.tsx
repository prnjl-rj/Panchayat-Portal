import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, 
  Calendar, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  User, 
  Eye, 
  Tag, 
  BellRing,
  Lock,
  Unlock,
  Layers,
  Flame
} from "lucide-react";
import { Announcement } from "../types";

interface NoticeBoardViewProps {
  announcements: Announcement[];
  onPostAnnouncement: (title: string, content: string, sender: string, priority: "High" | "Normal") => Promise<void>;
}

export default function NoticeBoardView({ 
  announcements, 
  onPostAnnouncement 
}: NoticeBoardViewProps) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"All" | "High" | "Normal">("All");

  // Administrator Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sender, setSender] = useState("Society Management Committee");
  const [priority, setPriority] = useState<"High" | "Normal">("Normal");
  const [category, setCategory] = useState("Alert"); // Alert, Event, Meeting, Activity

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and content details cannot be blank.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Append category indicator to title or content if desired, or keep it standard
      const formattedTitle = category ? `[${category}] ${title}` : title;
      await onPostAnnouncement(formattedTitle, content, sender, priority);
      setSuccessMsg("Announced successfully! Residents will receive real-time updates.");
      setTitle("");
      setContent("");
      // Auto close/hide form after short delay
      setTimeout(() => {
        setSuccessMsg("");
      }, 3500);
    } catch (err) {
      setErrorMsg("Failed to post notice. Please verify network status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAnnouncements = selectedFilter === "All"
    ? announcements
    : announcements.filter(a => a.priority === selectedFilter);

  // Helper to format ISO date elegantly
  const formatNoticeDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="space-y-4 pb-8 h-full flex flex-col">
      {/* Upper Status Ribbon */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md relative overflow-hidden shrink-0">
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-500/20 border border-indigo-400/20 rounded-xl flex items-center justify-center text-amber-300">
              <Megaphone className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-indigo-200/90 font-mono">Bylaws Noticeboard</p>
              <h2 className="font-display font-bold text-sm leading-tight">Community Notice Board</h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9.5px] text-emerald-300/90 font-bold font-mono">REAL-TIME SYNC</span>
          </div>
        </div>

        {/* Short info bar */}
        <p className="text-[11px] text-indigo-100/70 mt-2.5 leading-relaxed">
          Official board for announcements, community audits, emergency protocols, and society assembly gatherings.
        </p>
      </div>

      {/* Admin Toggle Security Shield Header */}
      <div className="bg-white rounded-xl p-3 border border-neutral-100 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {isAdminMode ? (
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Lock className="w-4 h-4 text-indigo-700 font-bold" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
              <Unlock className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="text-xs font-bold text-neutral-800 font-display">Administrator Portal</h3>
            <p className="text-[9.5px] text-neutral-400 font-mono">Society Desk Mode</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setIsAdminMode(!isAdminMode);
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95 ${
            isAdminMode 
              ? "bg-amber-400 text-indigo-950 shadow-sm" 
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          {isAdminMode ? "DISCONNECT ADMIN" : "ACCESS ADMIN AS COMMITTEE"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isAdminMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm space-y-3 shrink-0"
          >
            <div className="flex items-center justify-between pb-1 border-b border-indigo-50">
              <span className="text-xs font-bold text-indigo-900 font-display flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Dispatch Official Notice
              </span>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                SSL AUTHENTICATED
              </span>
            </div>

            <form onSubmit={handleSubmitNotice} className="space-y-3">
              {errorMsg && (
                <div className="bg-red-50 text-red-700 p-2 rounded-xl text-[11px] flex items-center gap-1.5 border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-[11px] flex items-center gap-1.5 border border-emerald-100">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              {/* Notice Title */}
              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-mono text-neutral-400 font-bold">Concept Notice Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Annual General Body Meeting (AGM)"
                  className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none font-medium placeholder-neutral-400"
                />
              </div>

              {/* Categorization & Priority */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono text-neutral-400 font-bold">Class Tag</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    title="Class Tag"
                    className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-neutral-700 font-medium"
                  >
                    <option value="Alert">⚠️ Alert</option>
                    <option value="Event">🎉 Event</option>
                    <option value="Meeting">📅 Meeting</option>
                    <option value="Maintenance">🔧 Maintenance</option>
                    <option value="Audit">📊 Audit Report</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono text-neutral-400 font-bold">Severity Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    title="Severity Level"
                    className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none text-neutral-700 font-medium"
                  >
                    <option value="Normal">Normal Notification</option>
                    <option value="High">🚨 High Priority (Alert Pin)</option>
                  </select>
                </div>
              </div>

              {/* Dispatch Sender Authority */}
              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-mono text-neutral-400 font-bold">Sender Authority Signature</label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g. Management Office General Secretary"
                  className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none font-medium text-neutral-800"
                />
              </div>

              {/* Detailed Content Description */}
              <div className="space-y-1">
                <label className="text-[9.5px] uppercase font-mono text-neutral-400 font-bold">Notice Context Description</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Insert exact timelines, expectations, contact details, and bylaws guidelines for residents to read..."
                  rows={3}
                  className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 focus:border-indigo-500 rounded-xl text-xs focus:outline-none font-sans text-neutral-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-brand-emerald hover:bg-indigo-900 text-white rounded-xl font-bold font-display text-xs transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                {isSubmitting ? "Dispatching to Board..." : "Publish Announcement"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements and Board feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 min-h-0">
        {/* Filters and Header Indicator */}
        <div className="flex items-center justify-between pb-1 shrink-0">
          <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">
            Bulletin Board Listings
          </span>
          <div className="flex items-center gap-1 text-[10px]">
            {["All", "High", "Normal"].map(f => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f as any)}
                className={`px-2 py-1 rounded-lg border font-mono font-bold transition-all ${
                  selectedFilter === f
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-white text-neutral-400 border-neutral-100 hover:text-neutral-600"
                }`}
              >
                {f === "High" ? "🚨 Alerts" : f}
              </button>
            ))}
          </div>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-neutral-100 text-center flex flex-col items-center justify-center">
            <BellRing className="w-10 h-10 text-neutral-300 mb-2" />
            <p className="font-display font-medium text-neutral-600 text-sm">No notices filed yet</p>
            <p className="text-[11px] text-neutral-400 mt-1 leading-normal max-w-xs">
              Check back soon of any community notifications published by society office committee of Greenwood Heights.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredAnnouncements.map((ann, idx) => {
              const isHighPriority = ann.priority === "High";
              
              return (
                <div 
                  key={ann.id || idx}
                  className={`bg-white rounded-2xl p-4 border transition-all hover:shadow-md relative overflow-hidden ${
                    isHighPriority 
                      ? "border-red-100 bg-red-50/10 shadow-[0_4px_12px_rgba(239,68,68,0.04)]" 
                      : "border-neutral-100 shadow-sm"
                  }`}
                >
                  {/* Priority banner strip */}
                  {isHighPriority && (
                    <div className="absolute right-0 top-0 text-[8.5px] uppercase font-mono bg-red-500 text-white px-2 py-0.5 rounded-bl font-extrabold flex items-center gap-0.5 animate-pulse">
                      <Flame className="w-2.5 h-2.5 fill-current" /> CRITICAL
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                      isHighPriority ? "bg-red-100 text-red-600 animate-pulse" : "bg-neutral-50 text-neutral-600"
                    }`}>
                      <Megaphone className="w-4 center-text" />
                    </div>

                    <div className="space-y-1 flex-1 pr-6">
                      <h4 className="font-display font-bold text-xs text-neutral-800">
                        {ann.title}
                      </h4>
                      <p className="text-[11px] text-neutral-600 font-sans leading-relaxed whitespace-pre-wrap">
                        {ann.content}
                      </p>

                      {/* Info Footer Tags Row */}
                      <div className="flex flex-wrap gap-y-1.5 items-center justify-between pt-2 border-t border-neutral-50/80 text-[9.5px] text-neutral-400 font-mono mt-2">
                        <span className="flex items-center gap-1 text-neutral-500">
                          <User className="w-3 h-3 text-indigo-500 shrink-0" />
                          Authority: <b className="font-semibold text-neutral-600">{ann.sender}</b>
                        </span>
                        
                        <span className="flex items-center gap-1 text-neutral-400 shrink-0">
                          <Clock className="w-3 h-3 shrink-0" />
                          {formatNoticeDate(ann.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
