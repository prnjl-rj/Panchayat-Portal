import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  Square, 
  Send, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Wrench, 
  User, 
  Cpu, 
  Calendar,
  Volume2,
  Trash2,
  Lock,
  CornerDownRight,
  Sparkles
} from "lucide-react";
import { Complaint } from "../types";

interface ComplaintsViewProps {
  complaints: Complaint[];
  onFileTextComplaint: (text: string, category?: string) => Promise<void>;
  onFileVoiceComplaint: (base64Audio: string, mimeType: string) => Promise<void>;
  onResolveComplaint: (id: string, response: string) => Promise<void>;
}

export default function ComplaintsView({
  complaints,
  onFileTextComplaint,
  onFileVoiceComplaint,
  onResolveComplaint
}: ComplaintsViewProps) {
  // Tabs & Forms Input State
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [typedText, setTypedText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Others');
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Filter variables
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Media Recorder references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Administrative Resolution State
  const [selectedResolveId, setSelectedResolveId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Handle timer for recording seconds
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 25) { // Limit to 25 seconds for size safety
            stopRecording();
            return 25;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Audio Capture Initializer
  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioError(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Recording is blocked or unsupported in this browser sandbox. Please use manual Text mode instead!");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback for Safari / iOS which prefers audio/mp4 or wav
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Close stream tracks immediately to disable mic indicator light
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audioBlob.size < 100) return; // Empty or fail recording

        setIsProcessing(true);
        try {
          // Convert audio blob to base64 string
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            await onFileVoiceComplaint(base64Audio, audioBlob.type);
            setIsProcessing(false);
          };
        } catch (err: any) {
          setAudioError("Processing audio translation failed. Try typing!");
          setIsProcessing(false);
        }
      };

      recorder.start(250); // Capture chunk every 250ms
      setIsRecording(true);
    } catch (err: any) {
      console.error("Mic access failed:", err);
      setAudioError(err.message || "Microphone access denied. Ensure browser permissions are granted, or type in your complaint.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Submit manual text complaint
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    
    setIsProcessing(true);
    try {
      await onFileTextComplaint(typedText, selectedCategory);
      setTypedText('');
      setInputMode('voice'); // Toggle back to voice
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit administrator resolution
  const handleResolveSubmit = async (id: string) => {
    if (!resolutionText.trim()) return;
    await onResolveComplaint(id, resolutionText);
    setResolutionText('');
    setSelectedResolveId(null);
  };

  // UI styling flags
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Plumbing": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Electrical": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Security": return "bg-rose-50 text-rose-600 border-rose-100";
      case "Sanitation": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Rules infraction": return "bg-violet-50 text-violet-600 border-violet-100";
      default: return "bg-neutral-50 text-neutral-600 border-neutral-100";
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "High": return "bg-rose-100 text-rose-800 border-rose-200";
      case "Medium": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
  };

  // Filter complaints list
  const filteredComplaints = categoryFilter === "All" 
    ? complaints 
    : complaints.filter(c => c.category === categoryFilter);

  return (
    <div className="space-y-5 pb-8">
      {/* Visual Instruction Header */}
      <div className="text-center space-y-1">
        <h2 className="font-display font-bold text-lg text-neutral-800">Voice Grievance Board</h2>
        <p className="text-xs text-neutral-500 max-w-[280px] mx-auto">
          Record your grievance or complain. Panchayat AI automatically transcribes, translates, and drafts tickets.
        </p>
      </div>

      {/* Input Toggle Frame */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setInputMode('voice')}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              inputMode === 'voice' 
                ? "bg-white text-emerald-800 shadow" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Mic className="w-4 h-4" /> Speak Grievance
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              inputMode === 'text' 
                ? "bg-white text-emerald-800 shadow" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Type Details
          </button>
        </div>

        {/* Input Chamber */}
        <AnimatePresence mode="wait">
          {inputMode === 'voice' ? (
            <motion.div 
              key="voice-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center py-6 space-y-4"
            >
              {/* Mic Circle */}
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <>
                    <motion.div 
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-red-100 rounded-full -z-10"
                    />
                    <motion.div 
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.8, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute inset-0 bg-red-50 rounded-full -z-10"
                    />
                  </>
                )}
                
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-all active:scale-95 cursor-pointer z-15 ${
                    isRecording 
                      ? "bg-red-500 shadow-red-200" 
                      : "bg-brand-emerald hover:bg-emerald-800 shadow-neutral-100"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isRecording ? <Square className="w-7 h-7 fill-white" /> : <Mic className="w-7 h-7" />}
                </button>
              </div>

              {/* Status or Recording time */}
              <div className="text-center">
                {isRecording ? (
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-red-500 tracking-wide flex items-center justify-center gap-1 bg-red-50 border border-red-100 px-3 py-1 rounded-full animate-bounce">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      RECORDING: {recordingSeconds}s / 25s
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-1.5">Tap the square lock button again to process complaint</p>
                  </div>
                ) : isProcessing ? (
                  <div className="space-y-2 py-1">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 rounded-full border-2 border-brand-emerald border-t-transparent animate-spin" />
                      <span className="text-xs font-bold font-display text-brand-emerald animate-pulse">Panchayat AI Transcribing Voice...</span>
                    </div>
                    <p className="text-[10px] text-neutral-400">Processing acoustics, detecting issue, translating files</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-700 font-semibold">Tap to record voice</p>
                    <p className="text-[10px] text-neutral-400">Record upto 25 seconds of clear society grievances</p>
                  </div>
                )}
              </div>

              {/* Glowing Soundwave lines during recording */}
              {isRecording && (
                <div className="flex items-center gap-1 py-1.5">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((val, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ height: isRecording ? [10, val * 8, 10] : 10 }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: idx * 0.05 }}
                      className="w-1 bg-brand-emerald rounded-full"
                    />
                  ))}
                </div>
              )}

              {/* Audio sandbox Errors block */}
              {audioError && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2 max-w-sm mt-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[10.5px] text-amber-800 leading-tight">
                    <span className="font-bold">Sandbox constraint:</span> {audioError}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.form 
              key="text-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleTextSubmit}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1">
                  Grievance Category Selection
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  title="Grievance Category Selection"
                  className="w-full bg-neutral-50 px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="Plumbing">Plumbing Needs</option>
                  <option value="Electrical">Power & Grid</option>
                  <option value="Security">Security & Checkposts</option>
                  <option value="Sanitation">Sanitation / Refuse Clean</option>
                  <option value="Rules infraction">Rules infraction / Parking</option>
                  <option value="Others">General / Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-1">
                  Describe the Issue / Complaint
                </label>
                <textarea
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  required
                  placeholder="e.g., Lift B is stuck at the ground floor with a warning buzzer beep..."
                  rows={4}
                  className="w-full bg-neutral-50 px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !typedText.trim()}
                className="w-full py-2.5 bg-brand-emerald text-white rounded-xl font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Analyzing Grievance...
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> File Grievance Ticket
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Grievance Inbox Header & Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-neutral-800">
            Society Grievance Inbox
          </h3>
          <span className="text-[10px] bg-indigo-50 text-brand-emerald font-bold border border-indigo-100 font-mono px-2 py-0.5 rounded-full uppercase">
            {filteredComplaints.length} tickets total
          </span>
        </div>

        {/* Categories filters scroll list */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {["All", "Plumbing", "Electrical", "Security", "Sanitation", "Rules infraction", "Others"].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold tracking-wide transition-all shrink-0 ${
                categoryFilter === cat
                  ? "bg-brand-emerald text-white border-brand-emerald"
                  : "bg-white text-neutral-600 border-neutral-100 hover:border-neutral-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Complaints Listing cards */}
        <div className="space-y-3.5">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-neutral-100 text-center flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-indigo-500 mb-2" />
              <p className="font-display font-medium text-neutral-700 text-sm">Clear Board!</p>
              <p className="text-xs text-neutral-400 mt-1">No active complaints logged for this category filter.</p>
            </div>
          ) : (
            filteredComplaints.map(comp => (
              <div 
                key={comp.id} 
                className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm relative space-y-3 hover:shadow-md transition-all"
              >
                {/* Header Metadata */}
                <div className="flex items-center justify-between">
                  {/* Category and Severity info */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9.5px] font-bold border rounded-md px-2 py-0.5 tracking-wider uppercase font-mono ${getCategoryColor(comp.category)}`}>
                      {comp.category}
                    </span>
                    <span className={`text-[9px] font-bold border rounded-md px-1.5 py-0.5 uppercase font-mono ${getSeverityBadge(comp.severity)}`}>
                      {comp.severity} Severity
                    </span>
                  </div>

                  {/* Operational status */}
                  <span className={`text-[10px] font-bold tracking-wide font-mono px-2 py-0.5 rounded-md ${
                    comp.status === "Resolved" 
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-100" 
                      : comp.status === "In Progress"
                      ? "text-amber-700 bg-amber-50 border border-amber-100"
                      : "text-rose-700 bg-rose-50 border border-rose-100"
                  }`}>
                    {comp.status}
                  </span>
                </div>

                {/* AI Summary and Details */}
                <div>
                  <h4 className="text-xs font-bold font-display text-neutral-800 flex items-center gap-1">
                    {comp.isAudio && <Volume2 className="w-3.5 h-3.5 text-brand-emerald" />}
                    {comp.summary}
                  </h4>
                  <p className="text-neutral-500 text-[11px] leading-relaxed mt-1 font-sans">
                    "{comp.text}"
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-100/60 pt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-neutral-300" />
                    {comp.residentName} ({comp.flatNumber})
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-300" />
                    {new Date(comp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Resolve reply block if resolved */}
                {comp.status === "Resolved" && comp.responseText && (
                  <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-2.5 mt-2 text-[11px] space-y-1">
                    <p className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolution Action Note
                    </p>
                    <p className="text-emerald-700 font-sans pl-4.5 leading-relaxed">
                      {comp.responseText}
                    </p>
                  </div>
                )}

                {/* Administrative resolved control button */}
                {comp.status !== "Resolved" && (
                  <div className="pt-1.5 border-t border-neutral-50 flex justify-end">
                    {selectedResolveId === comp.id ? (
                      <div className="w-full space-y-2 mt-1 bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                        <textarea
                          value={resolutionText}
                          onChange={(e) => setResolutionText(e.target.value)}
                          placeholder="Type administrative action note here..."
                          rows={2}
                          className="w-full bg-white px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-800 focus:outline-none focus:border-emerald-500 font-sans"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedResolveId(null)}
                            className="px-2 py-1 text-[10px] font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResolveSubmit(comp.id)}
                            disabled={!resolutionText.trim()}
                            className="px-3 py-1 text-[10px] font-bold text-white bg-brand-emerald hover:bg-emerald-800 rounded-md shadow-sm transition-colors"
                          >
                            Mark Solved
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedResolveId(comp.id)}
                        className="text-[9.5px] text-brand-emerald hover:text-indigo-800 transition-colors font-bold flex items-center gap-0.5 uppercase tracking-wider font-mono bg-indigo-50 px-2 py-1 rounded"
                      >
                        Supervisor: Resolve Issue
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Disclaimer on AI Security */}
      <div className="p-3.5 bg-neutral-100 rounded-xl flex items-start gap-2 border border-neutral-200/50">
        <Cpu className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
        <p className="text-[9.5px] text-neutral-500 leading-normal font-mono">
          Complaints filed via voice or text are parsed safely. Audio translation leverages Greenwood Gemini 3.5-flash context nodes. Standard offline translation backup active.
        </p>
      </div>
    </div>
  );
}
