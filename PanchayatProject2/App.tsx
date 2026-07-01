// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });


import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Home, 
  Briefcase, 
  AlertOctagon, 
  BookMarked, 
  Bell, 
  Wifi, 
  Battery, 
  Smartphone,
  Cpu,
  RefreshCw,
  Sparkles,
  Info,
  Megaphone,
  Compass,
  Lock,
  MessageCircle,
  Mail
} from "lucide-react";

// Subviews
import HomeView from "./components/HomeView";
import ComplaintsView from "./components/ComplaintsView";
import RulebookView from "./components/RulebookView";
import NoticeBoardView from "./components/NoticeBoardView";
import ServicesView from "./components/ServicesView";
import ChatView from "./components/ChatView";
import NotificationDrawer from "./components/NotificationDrawer";
import LoginScreen from "./components/LoginScreen";
import OfflineMap from "./components/OfflineMap";
import UserProfileModal from "./components/UserProfileModal";
import GmailView from "./components/GmailView";
import OwnerDashboard from "./components/OwnerDashboard";

// Local type definitions (inlined to avoid missing external ./types module)
type ID = string;
export interface AppUser {
  id: ID;
  name: string;
  email?: string;
  flatNumber?: string;
  phone?: string;
  societyId?: ID;
  role?: string;
  subscriptionType?: string;
  subscriptionExpiresAt?: string;
  createdAt?: string;
  isRegisteredResident?: boolean;
}

export interface Society {
  id: ID;
  name: string;
  address?: string;
  city?: string;
  adminName?: string;
  adminPhone?: string;
  unitsCount?: number;
  registeredAt?: string;
  rules?: string[];
}

export interface Notification {
  id: ID;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface Complaint {
  id: ID;
  title: string;
  description?: string;
  raisedBy?: ID;
  status?: string;
  createdAt?: string;
}

export interface ServiceStaff {
  id: ID;
  name: string;
  role?: string;
  category?: string;
  phone?: string;
}

export interface ServiceRequest {
  id: ID;
  serviceType: string;
  requesterId?: ID;
  staffId?: ID;
  staffName?: string;
  category?: string;
  flatNumber?: string;
  timeSlot?: string;
  status?: string;
  paymentStatus?: string;
  transactionId?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface VisitorRecord {
  id: ID;
  name: string;
  vehicle?: string;
  visitedAt?: string;
}

export interface Announcement {
  id: ID;
  title: string;
  content?: string;
  sender?: string;
  priority?: "High" | "Normal";
  postedAt?: string;
  date?: string;
}

export interface Transaction {
  id: ID;
  requestId?: ID;
  staffName?: string;
  category?: string;
  amount: number;
  paymentMethod?: 'UPI' | 'Card' | 'NetBanking';
  status?: string;
  timestamp?: string;
  transactionId?: string;
  date?: string;
  description?: string;
}

export interface SosAlert {
  id: ID;
  userId: ID;
  location?: { lat: number; lng: number } | null;
  triggeredAt?: string;
  active?: boolean;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>({
  id: "user-001",
  name: "Test User",
  email: "test@example.com",
  flatNumber: "A-101",
  phone: "+91 9876543210",
  societyId: "def-greenwood",
  subscriptionType: "Free",
  subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  isRegisteredResident: true
});
  const [activeSoses, setActiveSoses] = useState<SosAlert[]>([]);
  const [isOfflineMapOpen, setIsOfflineMapOpen] = useState(false);
  const [isTriggeringSosLocal, setIsTriggeringSosLocal] = useState(false);

  const [currentTab, setCurrentTab] = useState<'home' | 'notices' | 'services' | 'complaints' | 'rulebook' | 'chat' | 'mail'>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Multi-society Tenant configs
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>("def-greenwood");
  const [selectedSociety, setSelectedSociety] = useState<Society | null>({
    id: "def-greenwood",
    name: "Greenwood Heights Society",
    address: "Sector 14, Royal Greens Enclave",
    city: "Gurgaon, Haryana",
    adminName: "Mr. Raj Kumar (General Secretary)",
    adminPhone: "+91 98765 00001",
    unitsCount: 450,
    registeredAt: new Date().toISOString()
  });
  const [showManageSocietiesModal, setShowManageSocietiesModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

  // Registration Form State
  const [regIsSubmitting, setRegIsSubmitting] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regFormMode, setRegFormMode] = useState<"switch" | "register">("switch");
  const [regForm, setRegForm] = useState({
    name: "",
    address: "",
    city: "",
    adminName: "",
    adminPhone: "",
    unitsCount: 150
  });

  // Core Data states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [staffList, setStaffList] = useState<ServiceStaff[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  // Local Emulator UI items
  const [statusTime, setStatusTime] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Clock Ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setStatusTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all states from Express full-stack API
  const syncStateData = async (silent = false, customSocId?: string) => {
    const activeSocId = customSocId || selectedSocietyId;
    if (!silent) setIsSyncing(true);
    try {
      // Synchronize list of active societies
      const socListRes = await fetch("/api/societies");
      if (socListRes.ok) {
        const activeSocList: Society[] = await socListRes.json();
        setSocieties(activeSocList);
        const resolvedSoc = activeSocList.find(s => s.id === activeSocId) || activeSocList[0];
        if (resolvedSoc) setSelectedSociety(resolvedSoc);
      }

      // Shared isolated header
      const headers = {
        "Content-Type": "application/json",
        "X-Society-Id": activeSocId
      };

      const [notRes, compRes, reqRes, annRes, visRes, staffRes, payRes, sosRes] = await Promise.all([
        fetch("/api/notifications", { headers }),
        fetch("/api/complaints", { headers }),
        fetch("/api/service-requests", { headers }),
        fetch("/api/announcements", { headers }),
        fetch("/api/visitors", { headers }),
        fetch("/api/services/directory", { headers }),
        fetch("/api/payments/history", { headers }),
        fetch("/api/sos/active", { headers }).catch(() => null)
      ]);

      if (notRes.ok) setNotifications(await notRes.json());
      if (compRes.ok) setComplaints(await compRes.json());
      if (reqRes.ok) setRequests(await reqRes.json());
      if (annRes.ok) setAnnouncements(await annRes.json());
      if (visRes.ok) setVisitors(await visRes.json());
      if (staffRes.ok) setStaffList(await staffRes.json());
      if (payRes.ok) setTransactionHistory(await payRes.json());
      if (sosRes && sosRes.ok) setActiveSoses(await sosRes.json());

      setIsOfflineMode(false);
    } catch (err) {
      console.warn("Full stack endpoints unavailable or offline. Accessing simulated client values.", err);
      setIsOfflineMode(true);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  // Run on startup
  useEffect(() => {
    syncStateData(false, selectedSocietyId);
  }, [selectedSocietyId]);

  // Real-time polling for service updates and notifications (runs once every 4 seconds)
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      // Fetch small updates silently to keep UI fluid
      syncStateData(true, selectedSocietyId);
    }, 4000);

    return () => clearInterval(pollingInterval);
  }, [selectedSocietyId]);

  // --- API Action Dispatches ---

  // Post official announcement / notice board entry
  const handlePostAnnouncement = async (title: string, content: string, sender: string, priority: "High" | "Normal") => {
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({ title, content, sender, priority })
      });
      if (res.ok) {
        await syncStateData(true);
      } else {
        throw new Error("Failed to post official announcement");
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const fallbackAnn: Announcement = {
        id: `ann-local-${Math.random().toString(36).substr(2, 9)}`,
        title,
        content,
        sender,
        priority,
        date: new Date().toISOString()
      };
      setAnnouncements(prev => [fallbackAnn, ...prev]);
    }
  };

  // Settle Outstanding Service Invoice Bookings securely
  const handlePayServiceRequest = async (requestId: string, paymentMethod: 'UPI' | 'Card' | 'NetBanking', amount: number) => {
    try {
      const res = await fetch(`/api/service-requests/${requestId}/pay`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({ paymentMethod, amount })
      });
      if (res.ok) {
        await syncStateData(true);
      } else {
        throw new Error("Failed to secure payment transaction");
      }
    } catch (err) {
      console.error(err);
      // Local fallback simulation
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, paymentStatus: 'Paid', transactionId: `TXN-LOCAL-${Math.random().toString(36).substr(2, 9)}` } : r));
      const targetReq = requests.find(r => r.id === requestId);
      if (targetReq) {
        const fallbackTxn: Transaction = {
          id: `tx-fallback-${Math.random()}`,
          requestId,
          staffName: targetReq.staffName,
          category: targetReq.category,
          amount,
          paymentMethod,
          status: "Success",
          timestamp: new Date().toISOString(),
          transactionId: `TXN-LOCAL-${Math.random().toString(36).substr(2, 9)}`
        };
        setTransactionHistory(prev => [fallbackTxn, ...prev]);
      }
    }
  };

  // Book service staff
  const handleBookStaff = async (staffId: string, flatNumber: string, timeSlot: string, notes?: string) => {
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({ staffId, flatNumber, timeSlot, notes })
      });
      if (res.ok) {
        await syncStateData(true); // Sync silently
      } else {
        throw new Error("Failed to register staff booking");
      }
    } catch (err) {
      console.error(err);
      // Client offline fallback insertion
      const mockNew: ServiceRequest = {
        id: `req-${Math.random()}`,
        serviceType: "StaffBooking",
        staffId,
        staffName: staffList.find(s => s.id === staffId)?.name || "Technician",
        category: staffList.find(s => s.id === staffId)?.category || "Field Help",
        flatNumber,
        timeSlot,
        status: "Requested",
        timestamp: new Date().toISOString()
      };
      setRequests(prev => [mockNew, ...prev]);
    }
  };

  // Submit typed grievance ticket
  const handleFileTextComplaint = async (text: string, category?: string) => {
    try {
      const res = await fetch("/api/complaints/text", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({ text, category })
      });
      if (res.ok) {
        await syncStateData(true);
      } else {
        throw new Error("Failed to submit grievance");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit voice recording grievance translated by AI
  const handleFileVoiceComplaint = async (base64Audio: string, mimeType: string) => {
    try {
      const res = await fetch("/api/complaints/voice", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({ audioData: base64Audio, mimeType })
      });
      if (res.ok) {
        await syncStateData(true);
      } else {
        throw new Error("Voice submission error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve an existing complaint
  const handleResolveComplaint = async (id: string, responseText: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}/resolve`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({ responseText })
      });
      if (res.ok) {
        await syncStateData(true);
      } else {
        throw new Error("Resolution filing error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Approve or Deny visitor at main gates
  const handleActionVisitor = async (id: string, action: 'Approve' | 'Deny') => {
    try {
      const res = await fetch(`/api/visitors/${id}/action`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        await syncStateData(true);
      } else {
        throw new Error("Visitor authorization failure");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- SOS Handlers ---
  const handleTriggerSos = async (locationDetails?: string) => {
    setIsTriggeringSosLocal(true);
    try {
      const res = await fetch("/api/sos/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({
          name: currentUser?.name || "Anonymous Resident",
          flatNumber: currentUser?.flatNumber || "Tower B - Lock Unknown",
          phone: currentUser?.phone || "+91 99911 22233",
          locationDetails: locationDetails || "Main Central Atrium Ground",
          latitude: 28.4595 + (Math.random() * 0.006 - 0.003),
          longitude: 77.0266 + (Math.random() * 0.006 - 0.003)
        })
      });
      if (res.ok) {
        // Trigger safe browser alert beacon noise
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, audioCtx.currentTime);
          osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
          osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.6);
          osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.9);
          
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
          
          osc.start();
          osc.stop(audioCtx.currentTime + 1.3);
        } catch (audioErr) {
          console.warn("Audio warning beacon skipped:", audioErr);
        }

        await syncStateData(true);
      }
    } catch (err) {
      console.error("SOS Trigger failed:", err);
    } finally {
      setIsTriggeringSosLocal(false);
    }
  };

  const handleResolveSos = async (id: string) => {
    try {
      const res = await fetch(`/api/sos/${id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        }
      });
      if (res.ok) {
        await syncStateData(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Renew Subscription inside App ---
  const handleRenewSubscriptionInsidePaywall = async (type: '1Month' | '4Months' | '1Year') => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/auth/renew-subscription", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({ email: currentUser.email, subscriptionType: type })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("panchayat_user_session", JSON.stringify(data.user));
        await syncStateData(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Fast-forward simulator inside App ---
  const handleSimulateSubscriptionExpiry = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/auth/simulate-expire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("panchayat_user_session", JSON.stringify(data.user));
        await syncStateData(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Fast trial reset button inside expired lock ---
  const handleSimulateTrialReset = async () => {
    if (!currentUser) return;
    try {
      // Create user session with standard Free Trial
      const res = await fetch("/api/auth/register-and-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser.name,
          email: currentUser.email,
          flatNumber: currentUser.flatNumber,
          phone: currentUser.phone,
          societyId: selectedSocietyId,
          subscriptionType: "Free"
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("panchayat_user_session", JSON.stringify(data.user));
        await syncStateData(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Query Rulebook Assistant via server Gemini API
  const handleAskAIQuery = async (question: string) => {
    try {
      const res = await fetch("/api/rules/ask", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Society-Id": selectedSocietyId
        },
        body: JSON.stringify({ question })
      });
      if (res.ok) {
        return await res.json();
      }
      throw new Error("AI query request error");
    } catch (err) {
      console.error(err);
      return {
        answer: "The Society AI Assistant could not be reached. Standard backup matching: Rules highlight the Gym is open 6 AM - 10 PM. Swimming pool closed Mondays.",
        isMock: true
      };
    }
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete single notification
  const handleDeleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Submit new registration details to back-end Full-Stack API
  const handleRegisterSocietySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.address || !regForm.city || !regForm.adminName || !regForm.adminPhone) {
      setRegError("Please specify all required fields.");
      return;
    }
    setRegIsSubmitting(true);
    setRegError("");
    setRegSuccess("");
    try {
      const res = await fetch("/api/societies/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm)
      });
      const data = await res.json();
      if (res.ok && data.society) {
        setRegSuccess(`Succesfully registered ${data.society.name}!`);
        // Refresh local memory and switch immediately
        setSelectedSocietyId(data.society.id);
        setShowManageSocietiesModal(false);
        // Reset form values
        setRegForm({
          name: "",
          address: "",
          city: "",
          adminName: "",
          adminPhone: "",
          unitsCount: 150
        });
        setRegFormMode("switch");
        await syncStateData(false, data.society.id);
      } else {
        setRegError(data.error || "Failed to register new housing society. Verify information.");
      }
    } catch (err: any) {
      console.error("Society Registration failed:", err);
      setRegError("Unable to establish tunnel connection to database backend.");
    } finally {
      setRegIsSubmitting(false);
    }
  };

  const unreadAlertsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none font-sans overflow-x-hidden">
      
      {/* Outer Aesthetic Container matching Android/iOS responsive screens */}
      <div className="w-full max-w-[430px] h-[92vh] sm:h-[860px] bg-neutral-900 rounded-[50px] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border-4 border-neutral-800 flex flex-col relative overflow-hidden backdrop-blur-xl">
        
        {/* Curved Device Frame Details (iOS Notch / Dynamic Island simulation) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-neutral-900 rounded-b-2xl z-50 flex items-center justify-between px-3 pointer-events-none">
          <div className="w-3.5 h-3.5 bg-neutral-800 rounded-full" /> {/* Camera hole */}
          <div className="w-16 h-1.5 bg-neutral-800 rounded-full" /> {/* Speaker line */}
        </div>

        {/* Screen Base Canvas Container */}
        <div className="flex-1 bg-[#f9fafb] rounded-[38px] overflow-hidden flex flex-col relative border border-neutral-900">
          
          {/* iOS / Android Native Header Status Bar */}
          <div className="bg-[#f9fafb] px-6 pt-3.5 pb-2 flex items-center justify-between text-neutral-800 font-medium text-xs tracking-tight select-none shrink-0 z-30">
            {/* Clock */}
            <span className="font-semibold text-[11.5px] font-mono">{statusTime || "12:00"}</span>
            
            {/* Status indicators */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-800 font-mono bg-emerald-100 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <Wifi className="w-2.5 h-2.5" /> 5G
              </span>
              <Battery className="w-4.5 h-4.5 text-neutral-800" />
            </div>
          </div>

          {!currentUser ? (
            <LoginScreen 
              societies={societies} 
              onSocietyRegistered={async () => {
                await syncStateData(true);
              }}
              onLoginSuccess={(u) => { 
                setCurrentUser(u); 
                localStorage.setItem("panchayat_user_session", JSON.stringify(u)); 
                setSelectedSocietyId(u.societyId);
                syncStateData(true, u.societyId); 
              }} 
            />
          ) : (currentUser.subscriptionExpiresAt && new Date(currentUser.subscriptionExpiresAt).getTime() < Date.now()) ? (
            <div className="flex-1 bg-[#1e293b] text-white z-40 flex flex-col justify-between p-6 overflow-y-auto text-left relative">
              <div className="flex flex-col items-center mt-6 text-center shrink-0">
                <div className="w-14 h-14 bg-red-950 border border-red-500 rounded-2xl flex items-center justify-center text-red-500 mb-3.5 shadow-lg shadow-red-500/10 animate-pulse">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="font-display font-extrabold text-base text-white">Access Locked</h2>
                <p className="text-[9.5px] uppercase font-mono tracking-widest text-[#f97316] mt-1 font-extrabold">Subscription Expired</p>
                
                <p className="text-[11.2px] text-neutral-300 leading-normal max-w-[280px] mt-3">
                  Hello, resident member <strong>{currentUser.name}</strong> ({currentUser.flatNumber}). The safety subscription level for your profile has expired. Re-authenticate standard portal access to monitor gate coordinates and active notifications.
                </p>
              </div>

              <div className="space-y-2.5 flex-1 my-4 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Select Secure Renewal Plan:</p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handleRenewSubscriptionInsidePaywall("1Month")}
                    className="w-full p-3 bg-neutral-900 border border-neutral-850 hover:border-slate-800 rounded-xl flex items-center justify-between text-left active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div>
                      <span className="block text-xs font-bold text-white">Bronze 1-Month Plan</span>
                      <span className="block text-[8.5px] text-neutral-400 mt-0.5">Renew standard access</span>
                    </div>
                    <span className="font-extrabold font-mono text-xs text-amber-300">₹50</span>
                  </button>

                  <button
                    onClick={() => handleRenewSubscriptionInsidePaywall("4Months")}
                    className="w-full p-3 bg-neutral-900 border border-neutral-850 hover:border-slate-800 rounded-xl flex items-center justify-between text-left active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div>
                      <span className="block text-xs font-bold text-white">Silver 4-Month Economy</span>
                      <span className="block text-[8.5px] text-neutral-400 mt-0.5">Most selected by apartment owners</span>
                    </div>
                    <span className="font-extrabold font-mono text-xs text-amber-300">₹150</span>
                  </button>

                  <button
                    onClick={() => handleRenewSubscriptionInsidePaywall("1Year")}
                    className="w-full p-3 bg-neutral-900 border border-neutral-850 hover:border-slate-800 rounded-xl flex items-center justify-between text-left active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div>
                      <span className="block text-xs font-bold text-white">Gold 1-Year Ultimate</span>
                      <span className="block text-[8.5px] text-neutral-400 mt-0.5">Continuous 12-Month premium gate logs</span>
                    </div>
                    <span className="font-extrabold font-mono text-xs text-amber-300">₹400</span>
                  </button>
                </div>
              </div>

              <div className="shrink-0 mt-auto pt-3 border-t border-neutral-800 flex flex-col gap-2">
                <div className="flex gap-2 w-full justify-between items-center text-[10px] text-neutral-500 font-mono">
                  <button 
                    onClick={() => {
                      setCurrentUser(null);
                      localStorage.removeItem("panchayat_user_session");
                    }}
                    className="underline hover:text-white cursor-pointer"
                  >
                    Log out of profile
                  </button>
                  
                  <button 
                    onClick={handleSimulateTrialReset}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    ⚡ Trial Reset / Bypass
                  </button>
                </div>
              </div>
            </div>
          ) : !selectedSociety ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white text-neutral-400 space-y-3">
               <div className="w-8 h-8 rounded-full border-2 border-brand-emerald border-t-transparent animate-spin" />
               <p className="text-xs font-semibold">Loading portal data...</p>
            </div>
          ) : currentUser.role === "admin" ? (
            <OwnerDashboard 
              currentUser={currentUser}
              society={selectedSociety}
              onLogout={() => {
                setCurrentUser(null);
                localStorage.removeItem("panchayat_user_session");
              }}
              onUpdateSociety={async (updatedSociety) => {
                setSelectedSociety(updatedSociety);
                setSocieties(prev => prev.map(s => s.id === updatedSociety.id ? updatedSociety : s));
                try {
                  await fetch(`/api/societies/${updatedSociety.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedSociety)
                  });
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          ) : (
            <>
              {/* Panchayat Portal Branding Header Section */}
          <div className="bg-[#f9fafb] px-5 py-2.5 border-b border-neutral-100 flex items-center justify-between shrink-0 z-30 relative">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-emerald rounded-xl flex items-center justify-center shadow-md shadow-emerald-950/25">
                <Building2 className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-extrabold text-xs sm:text-sm tracking-tight text-neutral-800 flex items-center gap-1">
                  Panchayat 
                  <span className="text-[8px] sm:text-[9.5px] font-bold font-mono tracking-wide text-brand-emerald bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100 uppercase">Portal</span>
                </h1>
                <button 
                  onClick={() => setShowManageSocietiesModal(true)}
                  className="text-[10px] font-bold text-[#c2410c] hover:text-[#ea580c] bg-amber-50 hover:bg-amber-100 border border-amber-200/50 px-1.5 py-0.5 rounded flex items-center gap-1 mt-0.5 transition-all text-left shrink-0 active:scale-95 cursor-pointer max-w-[150px]"
                >
                  <span className="truncate">{selectedSociety?.name || "Greenwood Heights"}</span>
                  <span className="text-[7.5px] text-emerald-800 font-mono font-extrabold bg-emerald-100 px-0.5 rounded border border-emerald-300">SWITCH</span>
                </button>
              </div>
            </div>

            {/* Notifications Alert Bell button */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => syncStateData()}
                disabled={isSyncing}
                className="p-2 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-500 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Sync database updates"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-brand-emerald" : ""}`} />
              </button>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-600 rounded-xl relative transition-all active:scale-95 cursor-pointer shrink-0"
                title="View notification events"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 border-2 border-white rounded-full text-[9px] font-extrabold text-white flex items-center justify-center animate-bounce">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* User Profile avatar entry button - top right corner */}
              <button
                onClick={() => setShowUserProfileModal(true)}
                className="p-1 hover:bg-neutral-100 active:bg-neutral-200 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0 border border-neutral-150 flex items-center gap-1"
                title="View registered resident profile"
              >
                <div className="w-6 h-6 rounded-lg bg-brand-emerald text-amber-300 font-extrabold flex items-center justify-center text-[10.5px]">
                  {currentUser?.name?.slice(0, 2).toUpperCase() || "PR"}
                </div>
              </button>
            </div>
          </div>

          {/* Primary Interactive Scrolling Tab Content Space */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-2 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {currentTab === "home" && (
                  <HomeView
                    announcements={announcements}
                    visitors={visitors}
                    requests={requests}
                    onActionVisitor={handleActionVisitor}
                    onNavigateTab={(tab) => setCurrentTab(tab as any)}
                    selectedSociety={selectedSociety}
                    activeSoses={activeSoses}
                    onTriggerSos={handleTriggerSos}
                    onResolveSos={handleResolveSos}
                    onNavigateOfflineMap={() => setIsOfflineMapOpen(true)}
                  />
                )}
                {currentTab === "notices" && (
                  <NoticeBoardView
                    announcements={announcements}
                    onPostAnnouncement={handlePostAnnouncement}
                  />
                )}
                {currentTab === "services" && (
                  <ServicesView
                    staffList={staffList}
                    activeRequests={requests}
                    transactionHistory={transactionHistory}
                    onBookStaff={handleBookStaff}
                    onPaySuccess={handlePayServiceRequest}
                  />
                )}
                {currentTab === "complaints" && (
                  <ComplaintsView
                    complaints={complaints}
                    onFileTextComplaint={handleFileTextComplaint}
                    onFileVoiceComplaint={handleFileVoiceComplaint}
                    onResolveComplaint={handleResolveComplaint}
                  />
                )}
                {currentTab === "rulebook" && (
                  <RulebookView
                    onAskAI={handleAskAIQuery}
                    societyRules={selectedSociety?.rules || []}
                    societyName={selectedSociety?.name || "Greenwood Heights"}
                  />
                )}
                {currentTab === "chat" && currentUser && selectedSociety && (
                  <ChatView
                    currentUser={currentUser}
                    societyId={selectedSociety.id}
                  />
                )}
                {currentTab === "mail" && (
                  <GmailView />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation Ribbon Bar */}
          <div className="bg-white border-t border-neutral-100 px-5 pt-2.5 pb-6 flex items-center justify-between shrink-0 z-30">
            {/* TAB: HOME */}
            <button
              onClick={() => setCurrentTab("home")}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                currentTab === "home" ? "text-brand-emerald scale-105 font-bold" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <Home className={`w-5 h-5 ${currentTab === "home" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[9.5px]">Home</span>
            </button>

            {/* TAB: CHAT */}
            <button
              onClick={() => setCurrentTab("chat")}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                currentTab === "chat" ? "text-brand-emerald scale-105 font-bold" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <MessageCircle className={`w-5 h-5 ${currentTab === "chat" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[9.5px]">Chat</span>
            </button>

            {/* TAB: MAIL */}
            <button
              onClick={() => setCurrentTab("mail")}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                currentTab === "mail" ? "text-brand-emerald scale-105 font-bold" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <Mail className={`w-5 h-5 ${currentTab === "mail" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[9.5px]">Mail</span>
            </button>

            {/* TAB: NOTICES */}
            <button
              onClick={() => setCurrentTab("notices")}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                currentTab === "notices" ? "text-brand-emerald scale-105 font-bold" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <Megaphone className={`w-5 h-5 ${currentTab === "notices" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[9.5px]">Notices</span>
            </button>

            {/* TAB: SERVICES */}
            <button
              onClick={() => setCurrentTab("services")}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                currentTab === "services" ? "text-brand-emerald scale-105 font-bold" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <Briefcase className={`w-5 h-5 ${currentTab === "services" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[9.5px]">Services</span>
            </button>

            {/* TAB: COMPLAINTS */}
            <button
              onClick={() => setCurrentTab("complaints")}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                currentTab === "complaints" ? "text-brand-emerald scale-105 font-bold" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <AlertOctagon className={`w-5 h-5 ${currentTab === "complaints" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[9.5px]">Grievance</span>
            </button>

            {/* TAB: RULEBOOK Assistant */}
            <button
              onClick={() => setCurrentTab("rulebook")}
              className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${
                currentTab === "rulebook" ? "text-brand-emerald scale-105 font-bold" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <BookMarked className={`w-5 h-5 ${currentTab === "rulebook" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[9.5px]">Bylaws AI</span>
            </button>
          </div>

          {/* Real-time Notification Drawer Overlay components */}
          <NotificationDrawer
            notifications={notifications}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onReadAll={handleMarkAllNotificationsRead}
            onDelete={handleDeleteNotification}
          />

          {/* User Demographics & Family Profile Modal */}
          {showUserProfileModal && currentUser && (
            <UserProfileModal
              currentUser={currentUser}
              selectedSociety={selectedSociety}
              onClose={() => setShowUserProfileModal(false)}
              onUpdateProfile={(updatedUser) => {
                setCurrentUser(updatedUser);
                localStorage.setItem("panchayat_user_session", JSON.stringify(updatedUser));
              }}
              onLogout={() => {
                setCurrentUser(null);
                localStorage.removeItem("panchayat_user_session");
              }}
            />
          )}

          {/* Multi-society Switching & Registration Modal Overlay */}
          {showManageSocietiesModal && (
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex flex-col justify-end">
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="bg-white rounded-t-[32px] p-5 max-h-[85%] overflow-y-auto border-t border-neutral-100 flex flex-col shadow-2xl relative text-left"
                id="societies-modal-panel"
              >
                {/* Header detail */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-emerald" />
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-neutral-800">Society Settings</h3>
                      <p className="text-[10px] text-neutral-400">Select or Register your tenant portal</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setShowManageSocietiesModal(false);
                      setRegFormMode("switch");
                      setRegError("");
                    }}
                    className="p-1 px-2.5 text-xs font-semibold bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Switch Modes tab bar */}
                <div className="grid grid-cols-2 gap-2 mb-4 shrink-0 bg-neutral-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setRegFormMode("switch"); setRegError(""); }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      regFormMode === "switch" ? "bg-white text-brand-emerald shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    Select Society
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRegFormMode("register"); setRegError(""); }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      regFormMode === "register" ? "bg-white text-[#c2410c] shadow-sm" : "text-neutral-500 hover:text-[#c2410c]"
                    }`}
                  >
                    ✙ Register New
                  </button>
                </div>

                {regError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-2.5 rounded-xl mb-4 leading-normal">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-2.5 rounded-xl mb-4 leading-normal">
                    {regSuccess}
                  </div>
                )}

                {regFormMode === "switch" ? (
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    <p className="text-[11px] text-neutral-400 font-medium">Currently Available Registered Societies:</p>
                    <div className="space-y-2">
                      {societies.map(soc => {
                        const isCurrent = soc.id === selectedSocietyId;
                        return (
                          <div
                            key={soc.id}
                            onClick={() => {
                              setSelectedSocietyId(soc.id);
                              setShowManageSocietiesModal(false);
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 ${
                              isCurrent 
                                ? "border-brand-emerald bg-emerald-50/50 shadow-sm" 
                                : "border-neutral-100 hover:border-neutral-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-display font-bold text-xs text-neutral-800 flex items-center gap-1.5">
                                {soc.name}
                                {isCurrent && <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />}
                              </h4>
                              <span className="text-[9.5px] text-neutral-400 font-mono">{soc.unitsCount} units</span>
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-1 max-w-[320px] truncate">{soc.address}, {soc.city}</p>
                            
                            <hr className="my-2 border-neutral-100" />
                            
                            <div className="flex items-center justify-between text-[8.5px] text-neutral-500">
                              <span>President: {soc.adminName}</span>
                              <span className="font-mono bg-neutral-100 text-neutral-600 px-1 py-0.2 rounded">{soc.adminPhone}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSocietySubmit} className="space-y-3 flex-1">
                    <div>
                      <label className="block text-[10.5px] font-bold text-neutral-600 mb-1">
                        Society Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Skyline Vista Residency" 
                        value={regForm.name}
                        onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-emerald focus:bg-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-bold text-neutral-600 mb-1">
                          City / State *
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Mumbai, MH" 
                          value={regForm.city}
                          onChange={e => setRegForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-emerald focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-neutral-600 mb-1">
                          Housing Units Count
                        </label>
                        <input 
                          type="number" 
                          required
                          placeholder="e.g. 100"
                          value={regForm.unitsCount}
                          onChange={e => setRegForm(prev => ({ ...prev, unitsCount: parseInt(e.target.value) || 100 }))}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-emerald focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-neutral-600 mb-1">
                        Complete Address *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Sector 45, Opp Metro" 
                        value={regForm.address}
                        onChange={e => setRegForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-emerald focus:bg-white outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-bold text-neutral-600 mb-1">
                          President / Admin Name *
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="Secretary full name" 
                          value={regForm.adminName}
                          onChange={e => setRegForm(prev => ({ ...prev, adminName: e.target.value }))}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-emerald focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-neutral-600 mb-1">
                          Admin Contact Phone *
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. +91 98765 XXXXX" 
                          value={regForm.adminPhone}
                          onChange={e => setRegForm(prev => ({ ...prev, adminPhone: e.target.value }))}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-emerald focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={regIsSubmitting}
                      className="w-full py-2 bg-gradient-to-r from-emerald-700 to-indigo-900 text-white rounded-xl text-xs font-bold hover:shadow-lg active:scale-98 transition-all disabled:opacity-50 mt-3 flex items-center justify-center gap-1 select-none cursor-pointer"
                    >
                      {regIsSubmitting ? "Registering with AI Sync..." : "Confirm & Setup Portal"}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}

          {isOfflineMapOpen && (
            <OfflineMap 
              selectedSociety={selectedSociety} 
              isOpen={isOfflineMapOpen} 
              onClose={() => setIsOfflineMapOpen(false)} 
            />
          )}

          {/* Test Bypass fast forward utilities floating when logged in */}
          {currentUser && (
            <div className="absolute bottom-16 right-3 z-45 flex flex-col gap-1.5 items-end">
              <button
                onClick={() => setIsOfflineMapOpen(true)}
                className="p-2.5 bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:shadow-lg hover:brightness-110 text-white rounded-full transition-all active:scale-95 flex items-center justify-center border border-orange-500 shadow-md cursor-pointer"
                title="Open Offline Survival GPS Navigation Mapping"
              >
                <Compass className="w-4 h-4 animate-spin-slow" />
              </button>
            </div>
          )}

            </>
          )}
        </div>
      </div>

      {/* Unified Diagnostic Status Panel underneath frame (Desktop-only showcase details) */}
      <div className="mt-4 max-w-[430px] w-full text-[11px] text-neutral-500/80 font-mono text-center space-y-1.5 hidden sm:block">
        <div className="flex items-center justify-center gap-1.5 bg-neutral-200/50 px-3.5 py-1.5 rounded-xl border border-neutral-300/30 text-neutral-600">
          <Cpu className="w-3.5 h-3.5 text-brand-emerald animate-pulse" />
          <span>Full-Stack Development Shell active. Host port: 3000</span>
        </div>
        <p className="px-5 text-center leading-normal">
          Designed with Mobile-first touch density (44px) matching iOS & Android viewports. Integrates real-time state synchronization.
        </p>
      </div>
    </div>
  );
}
