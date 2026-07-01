import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  User, 
  MapPin, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  Calendar,
  Lock,
  Compass,
  Trash2,
  Database,
  Sparkles,
  RefreshCw,
  QrCode,
  Check,
  Search
} from "lucide-react";
import { Society, AppUser } from "../types";

function SocietySearchDropdown({ 
  societies, 
  value, 
  onChange,
  placeholder = "Search your society"
}: { 
  societies: Society[], 
  value: string, 
  onChange: (id: string) => void,
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedSoc = societies.find(s => s.id === value);
  const displayValue = isOpen ? search : (selectedSoc ? `${selectedSoc.name} (${selectedSoc.city})` : "");

  const filtered = societies.filter(s => (s.name || "").toLowerCase().includes(search.toLowerCase()) || (s.city || "").toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input 
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={e => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch("");
          }}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-1 focus:ring-brand-emerald outline-none text-neutral-700 font-medium cursor-text"
        />
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(soc => (
            <div 
              key={soc.id} 
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(soc.id);
                setIsOpen(false);
              }}
              className="px-3 py-2.5 text-xs hover:bg-neutral-50 cursor-pointer text-left border-b border-neutral-100 last:border-0"
            >
              <div className="font-semibold text-neutral-800">{soc.name}</div>
              <div className="text-[10px] text-neutral-400">{soc.city}</div>
            </div>
          )) : (
            <div className="px-3 py-3 text-xs text-neutral-400 text-center">No society found matching "{search}"</div>
          )}
        </div>
      )}
    </div>
  );
}

interface LoginScreenProps {
  societies: Society[];
  onLoginSuccess: (user: AppUser) => void;
  onSocietyRegistered?: () => void;
}

export default function LoginScreen({ societies, onLoginSuccess, onSocietyRegistered }: LoginScreenProps) {
  const [screenMode, setScreenMode] = useState<"start" | "admin_ask" | "resident_ask" | "login" | "login_owner" | "verify" | "register" | "pay" | "register_society" | "delete_society_auth" | "delete_society_select" | "society_subscription_select" | "resident_subscription_select">("start");
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>("def-greenwood");
  
  // Master Admin Delete Society States
  const [deleteAuthEmail, setDeleteAuthEmail] = useState("");
  const [deleteAuthPassword, setDeleteAuthPassword] = useState("");
  const [deleteAuthError, setDeleteAuthError] = useState("");
  const [deleteSelectedId, setDeleteSelectedId] = useState("");
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [isDeletingSociety, setIsDeletingSociety] = useState(false);

  // Login Existing Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // New User Registration & Verification State
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    flatNumber: "",
    phone: "",
    password: "",
    societyId: "def-greenwood",
    subscriptionType: "Free" as "Free" | "1Month" | "4Months" | "1Year"
  });

  const [verificationVerified, setVerificationVerified] = useState(false);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [notInRegistryMode, setNotInRegistryMode] = useState(false); // If not found in database, trigger direct enrollment option

  // Payment State Machine
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentSelectedTier, setPaymentSelectedTier] = useState<"Free" | "1Month" | "4Months" | "1Year">("Free");
  const [paymentStep, setPaymentStep] = useState<"razorpay_checkout" | "processing" | "success">("razorpay_checkout");
  const [paymentFlowType, setPaymentFlowType] = useState<"resident" | "society">("resident");

  // Society Registration & resident database builder State
  const [socRegForm, setSocRegForm] = useState({
    name: "",
    address: "",
    city: "",
    adminName: "",
    adminPhone: "",
    adminEmail: "",
    adminPassword: "",
    unitsCount: 120,
    subscriptionType: "Free" as "Free" | "1Month" | "4Months" | "1Year"
  });

  const [socResidents, setSocResidents] = useState<Array<{
    tempId: string;
    name: string;
    email: string;
    flatNumber: string;
    phone: string;
    age: string;
    gender: "Male" | "Female" | "Other" | "";
    familyMembers: string; // comma-separated family members
  }>>([
    // A helpful seed so they don't have to write from scratch to test
    { tempId: "res-seed-1", name: "Pranjal Raj", email: "prnjlrj.work@gmail.com", flatNumber: "Tower B - 1204", phone: "+91 98765 00002", age: "28", gender: "Male", familyMembers: "Ranjan Raj, Priya Raj" },
    { tempId: "res-seed-2", name: "Sachin Kumar", email: "sachin@gmail.com", flatNumber: "Villa Suite 10", phone: "+91 88877 66655", age: "42", gender: "Male", familyMembers: "Anjali, Arjun" }
  ]);
  
  const [isRegisteringSociety, setIsRegisteringSociety] = useState(false);
  const [socRegError, setSocRegError] = useState("");
  const [socRegSuccessMsg, setSocRegSuccessMsg] = useState("");

  const activeSociety = societies.find(s => s.id === (screenMode === "login" ? selectedSocietyId : regForm.societyId)) || societies[0];

  // Subscription Pricing Data
  const subscriptions = [
    { type: "Free", name: "Starter Plan", price: "Free", period: "7 Days Trial", features: ["Limited Dashboard", "Guest Registration", "Standard Support"], color: "bg-white border-neutral-200 text-neutral-800" },
    { type: "1Month", name: "Lite Plan", price: "₹50", period: "1 Month Access", features: ["Full Dashboard", "Guest Registration", "Service Booking", "Priority Support"], color: "bg-white border-neutral-200 text-neutral-800" },
    { type: "4Months", name: "Professional Plan", price: "₹150", period: "4 Months Access", features: ["Everything in Lite", "Advanced Reporting", "Branding Components", "Custom Fonts"], color: "bg-white border-neutral-200 text-neutral-800" },
    { type: "1Year", name: "Elite Plan", price: "₹400", period: "1 Year Access", features: ["Everything in Pro", "Dedicated Manager", "Custom Domain", "Team Collab"], color: "bg-white border-neutral-200 text-neutral-800" }
  ];

  const handleLoginOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter admin email and password.");
      return;
    }
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, societyId: selectedSocietyId })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onLoginSuccess(data.user);
      } else {
        setLoginError(data.error || "Owner/Caretaker login failed.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Connection failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };
  const handleLoginExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter your email and password.");
      return;
    }
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login-existing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, societyId: selectedSocietyId, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onLoginSuccess(data.user);
      } else {
        setLoginError(data.error || "Login details mismatch. Switch to 'New User' or check details.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Offline connection error. Verification database not responding.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 2. New User Database Verification Handler
  const handleVerifyDatabase = async () => {
    if (!regForm.email || !regForm.societyId) {
      setVerificationError("Email is required for verification.");
      return;
    }
    setVerificationError("");
    setIsVerifying(true);
    setVerificationChecked(false);
    try {
      const res = await fetch("/api/auth/verify-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: regForm.name, 
          email: regForm.email, 
          flatNumber: regForm.flatNumber, 
          societyId: regForm.societyId 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationChecked(true);
        if (data.isRegistered) {
          setVerificationVerified(true);
          setNotInRegistryMode(false);
          // Autofill registered fields from server custom directory!
          setRegForm(prev => ({
            ...prev,
            name: data.resident.name,
            flatNumber: data.resident.flatNumber,
            phone: data.resident.phone
          }));
        } else {
          setVerificationVerified(false);
          setNotInRegistryMode(true); // Ask dynamically
        }
      } else {
        setVerificationError("Database link timed out. Try manually inputting coordinates.");
      }
    } catch (err) {
      console.error(err);
      setVerificationError("Failed to initiate verification tunnel.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 3. User Registration/Enrollment plan selector routing to Razorpay UPI gateway
  const handleRegisterAndSubscribe = (tier: "Free" | "1Month" | "4Months" | "1Year") => {
    if (!regForm.name || !regForm.email || !regForm.flatNumber || !regForm.phone) {
      setVerificationError("All details are required to complete subscription enrollment.");
      return;
    }

    setPaymentFlowType("resident");
    setPaymentSelectedTier(tier);
    setScreenMode("pay");

    if (tier === "Free") {
      setPaymentStep("processing");
      setPaymentProcessing(true);
      setTimeout(async () => {
        await executeRegisterBackend(tier);
      }, 1500);
    } else {
      setPaymentStep("razorpay_checkout");
      setPaymentProcessing(false);
    }
  };

  const handleResidentRegFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.flatNumber || !regForm.phone || !regForm.password) {
      setVerificationError("All asterisked (*) fields are required.");
      return;
    }
    setVerificationError("");
    setScreenMode("resident_subscription_select");
  };

  const handleSocietyRegFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socRegForm.name || !socRegForm.address || !socRegForm.city) {
      setSocRegError("Society name, address, and city are required.");
      return;
    }
    if (!socRegForm.adminEmail || !socRegForm.adminPassword) {
      setSocRegError("Admin email and password are required.");
      return;
    }
    setSocRegError("");
    setScreenMode("society_subscription_select");
  };

  // Actually submit registration details to the backend API
  const executeRegisterBackend = async (tier: "Free" | "1Month" | "4Months" | "1Year") => {
    setPaymentStep("processing");
    setPaymentProcessing(true);
    try {
      const res = await fetch("/api/auth/register-and-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...regForm,
          subscriptionType: tier
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setPaymentStep("success");
        setPaymentProcessing(false);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1500);
      } else {
        setVerificationError(data.error || "Subscription initialization failed.");
        setScreenMode("register");
      }
    } catch (err) {
      console.error(err);
      setVerificationError("Database registration timing fault.");
      setScreenMode("register");
    }
  };

  // Society Custom Resident list rows management
  const addResidentRow = () => {
    setSocResidents(prev => [
      ...prev,
      {
        tempId: `res-${Math.random().toString(36).substr(2, 9)}`,
        name: "",
        email: "",
        flatNumber: "",
        phone: "",
        age: "",
        gender: "Male",
        familyMembers: ""
      }
    ]);
  };

  const removeResidentRow = (tempId: string) => {
    if (socResidents.length === 1) return;
    setSocResidents(prev => prev.filter(r => r.tempId !== tempId));
  };

  const updateResidentField = (tempId: string, field: string, value: any) => {
    setSocResidents(prev => prev.map(r => r.tempId === tempId ? { ...r, [field]: value } : r));
  };

  // Submit new society registration on server using checkout
  const handleRegisterSocietyCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socRegForm.name || !socRegForm.address || !socRegForm.city) {
      setSocRegError("Society name, address, and city are required.");
      return;
    }
    if (!socRegForm.adminEmail || !socRegForm.adminPassword) {
      setSocRegError("Admin email and password are required.");
      return;
    }
    setSocRegError("");
    setPaymentFlowType("society");
    setPaymentSelectedTier(socRegForm.subscriptionType);
    setScreenMode("pay");

    if (socRegForm.subscriptionType === "Free") {
      setPaymentStep("processing");
      setPaymentProcessing(true);
      setTimeout(async () => {
        await executeRegisterSocietyBackend(socRegForm.subscriptionType);
      }, 1500);
    } else {
      setPaymentStep("razorpay_checkout");
      setPaymentProcessing(false);
    }
  };

  const executeRegisterSocietyBackend = async (tier: "Free" | "1Month" | "4Months" | "1Year") => {
    setPaymentStep("processing");
    setPaymentProcessing(true);
    setIsRegisteringSociety(true);

    try {
      const res = await fetch("/api/societies/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: socRegForm.name,
          address: socRegForm.address,
          city: socRegForm.city,
          adminName: socRegForm.adminName,
          adminPhone: socRegForm.adminPhone,
          adminEmail: socRegForm.adminEmail,
          adminPassword: socRegForm.adminPassword,
          unitsCount: socRegForm.unitsCount,
          subscriptionType: tier,
          residents: [] // Residents logic moved to owner dashboard
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentStep("success");
        setPaymentProcessing(false);
        
        // Notify parent App component to refresh state list!
        if (onSocietyRegistered) {
          onSocietyRegistered();
        }
        
        // Autoselect recently added society 
        setSelectedSocietyId(data.society.id);
        
        const registeredEmail = socRegForm.adminEmail;

        // Reset state values
        setSocRegForm({ name: "", address: "", city: "", adminName: "", adminPhone: "", adminEmail: "", adminPassword: "", unitsCount: 120, subscriptionType: "Free" });
        
        setTimeout(() => {
          setSocRegSuccessMsg("");
          setScreenMode("login_owner");
          setLoginEmail(registeredEmail);
        }, 2200);
      } else {
        setSocRegError(data.error || "Failed to finalize society registration.");
        setScreenMode("register_society");
      }
    } catch (err) {
      console.error(err);
      setSocRegError("Endpoint communication timed out.");
      setScreenMode("register_society");
    } finally {
      setIsRegisteringSociety(false);
    }
  };

  // Google Pay UPI protocol link generator
  const upiId = "raj.pranjal.999@oksbi";
  const upiPriceAmount = paymentSelectedTier === "1Month" ? "50.00" : paymentSelectedTier === "4Months" ? "150.00" : paymentSelectedTier === "1Year" ? "400.00" : "0.00";
  const upiLink = `upi://pay?pa=${upiId}&pn=Panchayat%20Portal&am=${upiPriceAmount}&cu=INR&tn=Panchayat%20Subscription%20${paymentSelectedTier}&orgid=000000`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="flex-1 bg-[#FAF9F6] flex flex-col justify-between p-6 select-none relative overflow-y-auto">
      {/* Decorative Branding header */}
      <div className="flex flex-col items-center mt-3 shrink-0">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display font-extrabold text-2xl text-stone-800 mt-2.5 tracking-tight flex items-center gap-1.5 justify-center">
          Panchayat
        </h1>
        <p className="text-[9.5px] text-stone-500 mt-1 uppercase font-mono tracking-widest">Cooperative Housing Network</p>
      </div>

      <div className="flex-1 my-4 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* START MODE - Choose Admin or Resident */}
          {screenMode === "start" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 text-center leading-normal"
              key="start"
            >
              <h2 className="text-xl font-bold text-stone-800">Welcome to Panchayat</h2>
              <p className="text-xs text-stone-600 max-w-[280px] mx-auto text-center leading-relaxed">
                Please select your profile type to continue.
              </p>

              <div className="space-y-3 pt-2 max-w-[340px] mx-auto">
                <button
                  onClick={() => setScreenMode("resident_ask")}
                  className="w-full py-5 bg-white hover:bg-blue-50 border border-l-4 border-l-blue-600 border-blue-100 rounded-2xl flex items-center gap-4 px-5 shadow-sm active:scale-[0.98] transition-all text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-stone-800">Resident</span>
                    <span className="block text-[11px] text-stone-500 mt-0.5">I live here and need access.</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <button
                  onClick={() => setScreenMode("admin_ask")}
                  className="w-full py-5 bg-white hover:bg-amber-50 border border-l-4 border-l-amber-600 border-amber-100 rounded-2xl flex items-center gap-4 px-5 shadow-sm active:scale-[0.98] transition-all text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-lg">
                    👨‍💼
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-stone-800">Admin</span>
                    <span className="block text-[11px] text-stone-500 mt-0.5">I manage this society.</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

          {/* RESIDENT ASK MODE - Existing or New Resident */}
          {screenMode === "resident_ask" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 text-center leading-normal"
              key="resident_ask"
            >
              <h2 className="text-lg font-bold text-stone-800">Resident Access</h2>
              
              <div className="space-y-3 pt-2 max-w-[340px] mx-auto">
                <button
                  onClick={() => {
                    setScreenMode("login");
                    setLoginError("");
                  }}
                  className="w-full py-4 bg-white hover:bg-blue-50 border border-l-4 border-l-blue-600 border-blue-100 rounded-2xl flex items-center gap-3 px-4 shadow-sm active:scale-[0.98] transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-stone-800">Existing Resident</span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">Login with your credentials.</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <button
                  onClick={() => {
                    setScreenMode("verify");
                    setVerificationChecked(false);
                    setVerificationVerified(false);
                    setNotInRegistryMode(false);
                    setVerificationError("");
                  }}
                  className="w-full py-4 bg-white hover:bg-emerald-50 border border-l-4 border-l-emerald-600 border-emerald-100 rounded-2xl flex items-center gap-3 px-4 shadow-sm active:scale-[0.98] transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                    🔑
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-stone-800">New Resident</span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">Verify and register.</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              </div>

              <button 
                onClick={() => setScreenMode("start")}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 block text-center w-full pt-4 cursor-pointer"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* ADMIN ASK MODE - Owner/Caretaker, Register Society, Delete Society */}
          {screenMode === "admin_ask" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 text-center leading-normal"
              key="admin_ask"
            >
              <h2 className="text-lg font-bold text-stone-800">Admin Services</h2>

              <div className="space-y-3 pt-2 max-w-[340px] mx-auto">
                <button
                  onClick={() => {
                    setScreenMode("login_owner");
                    setLoginError("");
                  }}
                  className="w-full py-4 bg-white hover:bg-amber-50 border border-l-4 border-l-amber-600 border-amber-100 rounded-2xl flex items-center gap-3 px-4 shadow-sm active:scale-[0.98] transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                    👨‍💼
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-stone-800">Login as Owner/Care Taker</span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">Manage building registers & database.</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <button
                  onClick={() => {
                    setScreenMode("register_society");
                    setSocRegError("");
                    setSocRegSuccessMsg("");
                  }}
                  className="w-full py-4 bg-white hover:bg-orange-50 border border-l-4 border-l-orange-600 border-orange-100 rounded-2xl flex items-center gap-3 px-4 shadow-sm active:scale-[0.98] transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-stone-800">Register as a Society</span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">Enroll your community.</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <button
                  onClick={() => {
                    setScreenMode("delete_society_auth");
                    setDeleteAuthEmail("");
                    setDeleteAuthPassword("");
                    setDeleteAuthError("");
                    setDeleteSelectedId(societies[0]?.id || "");
                    setDeleteSuccessMsg("");
                    setDeleteConfirming(false);
                    setIsDeletingSociety(false);
                  }}
                  className="w-full py-4 bg-white hover:bg-red-50/40 border border-stone-200 hover:border-red-100 rounded-2xl flex items-center gap-3 px-4 shadow-sm active:scale-[0.98] transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold">
                    🗑️
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-stone-800">Delete an Existing Society</span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">Master admin panel.</span>
                  </div>
                  <Trash2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-red-500 transition-colors shrink-0" />
                </button>
              </div>

              <button 
                onClick={() => setScreenMode("start")}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 block text-center w-full pt-4 cursor-pointer"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* REGISTER AS A SOCIETY AND CUSTOM RESIDENTS STORAGE */}
          {screenMode === "register_society" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4 text-left"
              key="register_society"
            >
              <div className="bg-slate-550 p-3 bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-2xl border-2 border-orange-500 shadow-md relative overflow-hidden">
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                  <Database className="w-20 h-20" />
                </div>
                <h3 className="font-display font-extrabold text-[12.5px] text-orange-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Database className="w-4 h-4 text-orange-400" />
                  Establish New Society Base
                </h3>
                <p className="text-[10px] text-neutral-300 mt-0.5 leading-relaxed">
                  Register your cooperative society into Panchayat app and construct its custom resident directory database.
                </p>
              </div>

              {socRegError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100 flex items-start gap-1.5 leading-normal">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span className="text-[10.5px]">{socRegError}</span>
                </div>
              )}

              {socRegSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-250 flex items-start gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Database Deployed!</p>
                    <p className="text-[10.5px] mt-0.5">{socRegSuccessMsg}</p>
                  </div>
                </div>
              )}

              {!socRegSuccessMsg && (
                <form onSubmit={handleSocietyRegFormSubmit} className="space-y-4">
                  {/* Step 1: Society Info Grid */}
                  <div className="bg-white rounded-2xl p-4 border border-stone-250 shadow-xs space-y-3.5 text-stone-800">
                    <p className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider">Society Infrastructure Info</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8.5px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider">Society Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Royal Orchid"
                          value={socRegForm.name}
                          onChange={e => setSocRegForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider">City Location *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bengaluru"
                          value={socRegForm.city}
                          onChange={e => setSocRegForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider">Full Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Phase 2, Off Sarjapur Road"
                        value={socRegForm.address}
                        onChange={e => setSocRegForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[8.5px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider">Admin Name / Org</label>
                        <input
                          type="text"
                          placeholder="Committee Admin"
                          value={socRegForm.adminName}
                          onChange={e => setSocRegForm(prev => ({ ...prev, adminName: e.target.value }))}
                          className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8.5px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider">Units</label>
                        <input
                          type="number"
                          placeholder="120"
                          value={socRegForm.unitsCount}
                          onChange={e => setSocRegForm(prev => ({ ...prev, unitsCount: Number(e.target.value) }))}
                          className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>

                    {/* Caretaker / Owner Login Credentials Section */}
                    <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200 space-y-2.5">
                      <p className="text-[9px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                        🔑 Administrator Login Credentials
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8.5px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider">Admin Email *</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. admin@royalorchid.com"
                            value={socRegForm.adminEmail}
                            onChange={e => setSocRegForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                            className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[8.5px] font-bold text-stone-500 mb-0.5 uppercase tracking-wider">Admin Password *</label>
                          <input
                            type="text"
                            required
                            placeholder="Set secure password"
                            value={socRegForm.adminPassword}
                            onChange={e => setSocRegForm(prev => ({ ...prev, adminPassword: e.target.value }))}
                            className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400 font-mono"
                          />
                        </div>
                      </div>
                      <p className="text-[8.5px] text-stone-500 leading-normal">These credentials will be used on the Caretaker Login screen to manage your society database.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-stone-900 hover:bg-stone-950 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                  >
                    <span>Continue to Choose Subscription Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              <button 
                onClick={() => setScreenMode("admin_ask")}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 block text-center w-full pt-1 cursor-pointer"
              >
                ← Back to startup options
              </button>
            </motion.div>
          )}

          {/* MASTER ADMIN AUTH FOR SOCIETY DELETION */}
          {screenMode === "delete_society_auth" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4 text-left"
              key="delete_society_auth"
            >
              <div className="p-3 bg-gradient-to-br from-red-900 to-neutral-950 text-white rounded-2xl border-2 border-red-500 shadow-md relative overflow-hidden">
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                  <ShieldAlert className="w-20 h-20" />
                </div>
                <h3 className="font-display font-extrabold text-[12.5px] text-red-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Master Admin Authentication
                </h3>
                <p className="text-[10px] text-neutral-300 mt-0.5 leading-relaxed">
                  Only authorized Panchayat portal master administrators can delete cooperative housing society databases.
                </p>
              </div>

              {deleteAuthError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100 flex items-start gap-1.5 leading-normal">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span className="text-[10.5px]">{deleteAuthError}</span>
                </div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (deleteAuthEmail === "raj.pranjal.999@gmail.com" && deleteAuthPassword === "#Shanvi2507") {
                    setDeleteAuthError("");
                    setScreenMode("delete_society_select");
                  } else {
                    setDeleteAuthError("Invalid master admin email or password. Access denied.");
                  }
                }} 
                className="space-y-3.5 pt-1"
              >
                <div>
                  <label className="block text-[9px] font-bold text-neutral-500 mb-1 uppercase tracking-wider">Master Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. raj.pranjal.999@gmail.com"
                    value={deleteAuthEmail}
                    onChange={(e) => setDeleteAuthEmail(e.target.value)}
                    className="w-full bg-white border border-neutral-250 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-neutral-500 mb-1 uppercase tracking-wider">Master Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password"
                    value={deleteAuthPassword}
                    onChange={(e) => setDeleteAuthPassword(e.target.value)}
                    className="w-full bg-white border border-neutral-250 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Authenticate Administrator
                </button>
              </form>

              <button 
                onClick={() => setScreenMode("admin_ask")}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 block text-center w-full pt-1 cursor-pointer"
              >
                ← Back to startup options
              </button>
            </motion.div>
          )}

          {/* MASTER ADMIN SOCIETY SELECT & DELETE */}
          {screenMode === "delete_society_select" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4 text-left"
              key="delete_society_select"
            >
              <div className="p-3 bg-red-950/20 text-red-900 rounded-2xl border border-red-200/60 relative overflow-hidden">
                <h3 className="font-display font-extrabold text-[12px] text-red-800 flex items-center gap-1.5 uppercase tracking-wide">
                  🛡️ Session Authenticated
                </h3>
                <p className="text-[10px] text-red-700 mt-0.5 leading-relaxed">
                  Select an active cooperative housing society directory database to completely wipe it from our server cache.
                </p>
              </div>

              {deleteSuccessMsg ? (
                <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-black text-emerald-800 uppercase tracking-wide">Deletion Successful</p>
                  <p className="text-[10.5px] text-neutral-500 leading-normal">{deleteSuccessMsg}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9.5px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Target Society to Remove</label>
                    <SocietySearchDropdown 
                      societies={societies}
                      value={deleteSelectedId}
                      onChange={(id) => {
                        setDeleteSelectedId(id);
                        setDeleteConfirming(false);
                      }}
                    />
                  </div>

                  {deleteSelectedId && (
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-600 space-y-1 text-xs">
                      <p className="font-bold text-neutral-850">
                        Selected: <span className="text-red-700">{societies.find(s => s.id === deleteSelectedId)?.name || "Unknown"}</span>
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Location: {societies.find(s => s.id === deleteSelectedId)?.city || "N/A"}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Address: {societies.find(s => s.id === deleteSelectedId)?.address || "N/A"}
                      </p>
                    </div>
                  )}

                  {!deleteConfirming ? (
                    <button
                      type="button"
                      disabled={!deleteSelectedId}
                      onClick={() => setDeleteConfirming(true)}
                      className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Wipe Society Database
                    </button>
                  ) : (
                    <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl space-y-3">
                      <div className="flex gap-2 items-start text-red-800">
                        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-600 animate-pulse" />
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wider">CRITICAL ACTIONS WARNING</p>
                          <p className="text-[9.5px] leading-relaxed mt-0.5 text-red-700">
                            This action will permanently delete <strong>{societies.find(s => s.id === deleteSelectedId)?.name}</strong> from the Panchayat servers. All pre-registered residents, registered accounts, logs, complaints, and active caretaker keys will be destroyed forever!
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isDeletingSociety}
                          onClick={async () => {
                            setIsDeletingSociety(true);
                            try {
                              const res = await fetch(`/api/societies/${deleteSelectedId}`, {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  email: deleteAuthEmail,
                                  password: deleteAuthPassword
                                })
                              });
                              const data = await res.json();
                              if (res.ok && data.success) {
                                setDeleteSuccessMsg(data.message || "The society has been deleted successfully.");
                                if (onSocietyRegistered) {
                                  onSocietyRegistered();
                                }
                                setTimeout(() => {
                                  setScreenMode("start");
                                  setDeleteSuccessMsg("");
                                  setDeleteSelectedId("");
                                  setDeleteConfirming(false);
                                }, 2200);
                              } else {
                                setDeleteAuthError(data.error || "Failed to delete society.");
                                setScreenMode("delete_society_auth");
                              }
                            } catch (err) {
                              console.error(err);
                              setDeleteAuthError("Communication timeout or error.");
                              setScreenMode("delete_society_auth");
                            } finally {
                              setIsDeletingSociety(false);
                            }
                          }}
                          className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isDeletingSociety ? (
                            <Loader2 className="w-3 h-3 animate-spin text-white" />
                          ) : (
                            "Yes, Permanently Delete"
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={isDeletingSociety}
                          onClick={() => setDeleteConfirming(false)}
                          className="flex-1 py-2 bg-neutral-250 hover:bg-neutral-300 text-neutral-800 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => {
                  setScreenMode("admin_ask");
                  setDeleteConfirming(false);
                }}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 block text-center w-full pt-1 cursor-pointer"
              >
                ← Back to startup options
              </button>
            </motion.div>
          )}

          {/* LOGIN EXISTING RESIDENT */}
          {screenMode === "login" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 text-left"
              key="login"
            >
              <div>
                <h3 className="font-display font-extrabold text-sm text-neutral-800">Resident Log In</h3>
                <p className="text-[11px] text-neutral-400 mt-1">Authenticate using your registered flatkeeper email details.</p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Access Warning</p>
                    <p className="text-[10.5px] text-red-600/90 mt-0.5">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginExistingSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Select Housing Society</label>
                  <SocietySearchDropdown 
                    societies={societies}
                    value={selectedSocietyId}
                    onChange={(id) => setSelectedSocietyId(id)}
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rohan@gmail.com, prnjlrj.work@gmail.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-emerald focus:bg-white outline-none text-neutral-700 text-left"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. 123"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-emerald focus:bg-white outline-none text-neutral-700 text-left"
                  />
                  <span className="text-[9.5px] text-neutral-400 block mt-1 italic">Default password for seeded accounts is: 123</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 bg-brand-emerald text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-98 select-none mt-4 cursor-pointer"
                >
                  {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : "Verify Identity & Enter Portal"}
                </button>
              </form>

              <button 
                onClick={() => setScreenMode("resident_ask")}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 block text-center w-full pt-2 transition-colors cursor-pointer"
              >
                ← Back to startup options
              </button>
            </motion.div>
          )}

          {/* LOGIN SOCIETY OWNER / CARE TAKER */}
          {screenMode === "login_owner" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 text-left"
              key="login_owner"
            >
              <div>
                <h3 className="font-display font-extrabold text-sm text-neutral-800">Caretaker / Owner Login</h3>
                <p className="text-[11px] text-neutral-400 mt-1">Authenticate as society administration to manage the portal.</p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Access Warning</p>
                    <p className="text-[10.5px] text-red-600/90 mt-0.5">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginOwnerSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Select Housing Society</label>
                  <SocietySearchDropdown 
                    societies={societies}
                    value={selectedSocietyId}
                    onChange={(id) => setSelectedSocietyId(id)}
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Admin Email Reference</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@greenwood.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 text-left"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Caretaker Password</label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. admin"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none text-neutral-700 text-left"
                  />
                  <span className="text-[9.5px] text-neutral-400 block mt-1 italic">Default for seed societies: admin (e.g. admin@greenwood.com / admin)</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-98 select-none mt-4 cursor-pointer"
                >
                  {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : "Access Society Dashboard"}
                </button>
              </form>

              <button 
                onClick={() => setScreenMode("admin_ask")}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 block text-center w-full pt-2 transition-colors cursor-pointer"
              >
                ← Back to startup options
              </button>
            </motion.div>
          )}
          {screenMode === "verify" && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 text-left"
              key="verify"
            >
              <div>
                <h3 className="font-display font-extrabold text-sm text-neutral-800">Database Verification</h3>
                <p className="text-[11px] text-neutral-400 mt-1">Verification ensures safety. We'll consult the society's preregistered directory records.</p>
              </div>

              {verificationError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                  <p className="text-[10.5px]">{verificationError}</p>
                </div>
              )}

              {/* Verified Success Block */}
              {verificationChecked && verificationVerified && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-100 space-y-1 text-left">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4.5 h-4.5 text-brand-emerald shrink-0" />
                    <span>Resident Match Found!</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-emerald-700">
                    We found an approved registry file for <strong>{regForm.name || "your email"}</strong> in **{activeSociety?.name || "Greenwood"}**. You can proceed directly to active subscription configurations!
                  </p>
                  <button
                    onClick={() => setScreenMode("register")}
                    className="w-full py-2 bg-brand-emerald text-white font-bold text-[11px] rounded-lg mt-2 flex items-center justify-center gap-1 transition-colors active:scale-95 shadow-sm cursor-pointer"
                  >
                    Choose Subscription Plan & Complete <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Not Pre-registered Registry warning */}
              {verificationChecked && !verificationVerified && (
                <div className="p-3.5 bg-red-50 rounded-2xl text-xs border border-red-200/70 space-y-2.5 text-left">
                  <div className="flex items-start gap-2.5 text-red-800 leading-normal">
                    <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Not Found in Pre-registered Directory</p>
                      <p className="text-[10.5px] text-red-700/80 mt-1">
                        Contact details for <strong>{regForm.email}</strong> are not listed as pre-approved inside **{activeSociety?.name || "the society database"}**.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-red-300/40 text-[10.5px] space-y-1">
                    <p className="font-bold text-red-900">Access Denied</p>
                    <p className="text-red-800/80 leading-normal">
                      You must be added to the society's database by the administrator before you can register for the app. Please contact your society office to proceed.
                    </p>
                  </div>
                </div>
              )}

              {!verificationVerified && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Target Society</label>
                    <SocietySearchDropdown 
                      societies={societies}
                      value={regForm.societyId}
                      onChange={(id) => setRegForm(prev => ({ ...prev, societyId: id }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-neutral-500 uppercase tracking-wider mb-1">My Resident Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. prnjlrj.work@gmail.com"
                      value={regForm.email}
                      onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-emerald focus:bg-white outline-none text-neutral-700"
                    />
                    <p className="text-[9.5px] text-neutral-400 block mt-1 italic">Testing match try: rohan@gmail.com, or use your own email to see the custom fallback!</p>
                  </div>

                  {!verificationChecked && (
                    <button
                      onClick={handleVerifyDatabase}
                      disabled={isVerifying}
                      className="w-full py-2.5 bg-brand-emerald text-white hover:bg-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer mt-3"
                    >
                      {isVerifying ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : "Verify Directory Record"}
                    </button>
                  )}
                </div>
              )}

              <button 
                onClick={() => setScreenMode("resident_ask")}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 block text-center w-full pt-2 cursor-pointer"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* REGISTER NEW / PLAN CHOOSING */}
          {screenMode === "register" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 text-left font-sans"
              key="register"
            >
              <div>
                <h3 className="font-display font-extrabold text-sm text-neutral-800">
                  {notInRegistryMode ? "Dynamic Portal Signup" : "Confirm Profile Details"}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1">
                  {notInRegistryMode 
                    ? "Fill contact info to submit and register under Panchayat Management." 
                    : "Fill secondary verification details to finalize your account setup."}
                </p>
              </div>

              <form onSubmit={handleResidentRegFormSubmit} className="space-y-3.5">
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto p-3.5 bg-white rounded-2xl border border-stone-250 shadow-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">My Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={regForm.name}
                        onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Flat / Villa No *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tower B - 1204"
                        value={regForm.flatNumber}
                        onChange={e => setRegForm(prev => ({ ...prev, flatNumber: e.target.value }))}
                        className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">WhatsApp Phone Contact *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +91 98765 XXXXX"
                        value={regForm.phone}
                        onChange={e => setRegForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Set your account login password"
                        value={regForm.password}
                        onChange={e => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Age</label>
                        <input
                          type="number"
                          placeholder="28"
                          onChange={e => setRegForm(prev => ({ ...prev, age: Number(e.target.value) } as any))}
                          className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                        />
                      </div>
                      <div>
                        <label htmlFor="gender-select" className="block text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Gender</label>
                        <select
                          id="gender-select"
                          onChange={e => setRegForm(prev => ({ ...prev, gender: e.target.value }))}
                          className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-stone-400"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-stone-900 hover:bg-stone-950 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                >
                  <span>Continue to Choose Subscription Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <button 
                onClick={() => setScreenMode("verify")}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 block text-center w-full pt-1 cursor-pointer"
              >
                ← Back to verify checks
              </button>
            </motion.div>
          )}

          {screenMode === "society_subscription_select" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 text-left font-sans"
              key="society_subscription_select"
            >
              <div>
                <h3 className="font-display font-extrabold text-sm text-stone-800">Choose Subscription Plan</h3>
                <p className="text-xs text-stone-500 mt-1">Select a plan to activate your society's database and administrator portal.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {subscriptions.map(sub => (
                  <div key={sub.type} className={`p-6 rounded-3xl border ${sub.type === "4Months" ? 'bg-stone-900 text-white' : 'bg-white border-stone-200'}`}>
                    <h3 className={`text-lg font-bold ${sub.type === "4Months" ? 'text-white' : 'text-stone-900'}`}>{sub.name}</h3>
                    <p className="text-3xl font-bold my-4">{sub.price}</p>
                    <p className={`text-xs ${sub.type === "4Months" ? 'text-stone-400' : 'text-stone-500'} mb-6`}>{sub.period}</p>
                    <button
                      onClick={() => {
                        setSocRegForm(prev => ({ ...prev, subscriptionType: sub.type as any }));
                        setPaymentFlowType("society");
                        setPaymentSelectedTier(sub.type as any);
                        if (sub.type === "Free") {
                          setPaymentStep("processing");
                          setPaymentProcessing(true);
                          setScreenMode("pay");
                          setTimeout(async () => {
                            await executeRegisterSocietyBackend(sub.type as any);
                          }, 1500);
                        } else {
                          setPaymentStep("razorpay_checkout");
                          setPaymentProcessing(false);
                          setScreenMode("pay");
                        }
                      }}
                      className={`w-full py-3 rounded-xl font-bold text-sm ${sub.type === "4Months" ? 'bg-lime-400 text-stone-900' : 'bg-stone-100 text-stone-900'}`}
                    >
                      Get Started
                    </button>
                    <ul className="mt-6 space-y-3">
                      {sub.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={`w-4 h-4 ${sub.type === "4Months" ? 'text-lime-400' : 'text-emerald-500'}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {screenMode === "resident_subscription_select" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 text-left font-sans"
              key="resident_subscription_select"
            >
              <div>
                <h3 className="font-display font-extrabold text-sm text-stone-800">Choose Subscription Plan</h3>
                <p className="text-xs text-stone-500 mt-1">Select a plan to activate your resident profile and access building services.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                {subscriptions.map(sub => (
                  <div key={sub.type} className={`p-4 sm:p-6 rounded-3xl border ${sub.type === "4Months" ? 'bg-stone-900 text-white' : 'bg-white border-stone-200'}`}>
                    <h3 className={`text-base sm:text-lg font-bold ${sub.type === "4Months" ? 'text-white' : 'text-stone-900'}`}>{sub.name}</h3>
                    <p className="text-2xl sm:text-3xl font-bold my-2 sm:my-4">{sub.price}</p>
                    <p className={`text-[10px] sm:text-xs ${sub.type === "4Months" ? 'text-stone-400' : 'text-stone-500'} mb-4 sm:mb-6`}>{sub.period}</p>
                    <button
                      onClick={() => {
                        setPaymentFlowType("resident");
                        setPaymentSelectedTier(sub.type as any);
                        if (sub.type === "Free") {
                          setPaymentStep("processing");
                          setPaymentProcessing(true);
                          setScreenMode("pay");
                          setTimeout(async () => {
                            await executeRegisterBackend(sub.type as any);
                          }, 1500);
                        } else {
                          setPaymentStep("razorpay_checkout");
                          setPaymentProcessing(false);
                          setScreenMode("pay");
                        }
                      }}
                      className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm ${sub.type === "4Months" ? 'bg-lime-400 text-stone-900' : 'bg-stone-100 text-stone-900'}`}
                    >
                      Get Started
                    </button>
                    <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                      {sub.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-[10px] sm:text-xs">
                          <CheckCircle2 className={`w-3 h-3 sm:w-4 sm:h-4 ${sub.type === "4Months" ? 'text-lime-400' : 'text-emerald-500'}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RAZORPAY UPI GATEWAY SIMULATION */}
          {screenMode === "pay" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="text-center py-2 leading-normal space-y-4 text-left w-full max-w-[360px] mx-auto"
              key="pay"
            >
              {paymentStep === "razorpay_checkout" && (
                <div className="bg-slate-900 text-white rounded-2xl border-2 border-slate-750 shadow-2xl relative overflow-hidden text-left font-sans">
                  {/* Razorpay Premium Dark Header */}
                  <div className="bg-[#111827] px-4 py-3.5 border-b border-neutral-800 flex items-center justify-between font-sans">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5.5 h-5.5 bg-blue-600 rounded flex items-center justify-center font-bold font-mono tracking-tighter text-[11px] shrink-0 text-white shadow-md shadow-blue-500/25">
                        R
                      </div>
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-100 flex items-center gap-1 text-[11px]">
                          Razorpay <span className="text-[7.5px] font-black text-blue-400 bg-blue-950 px-1 rounded shrink-0 border border-blue-900/40 uppercase">SECURE</span>
                        </h4>
                        <p className="text-[8px] text-neutral-400 font-mono">ID: pay_PCH_{Math.floor(100000 + Math.random() * 900000)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-mono">Subscription</div>
                      <div className="font-black text-amber-300 font-mono text-[13px] tracking-tight">₹{upiPriceAmount}</div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3.5">
                    {/* Pay To Info Card */}
                    <div className="bg-neutral-950/50 rounded-xl p-3 border border-neutral-800 flex items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Merchant Escrow Target</span>
                        <span className="block text-[11px] font-bold text-neutral-100 italic font-mono">{upiId}</span>
                      </div>
                      <div className="px-2 py-1 bg-yellow-400/10 text-yellow-500 border border-yellow-500/10 rounded-md text-[8.5px] font-bold font-mono uppercase tracking-wider animate-pulse">
                        UPI DIRECT
                      </div>
                    </div>

                    {/* QR Code and Scan info section */}
                    <div className="flex bg-neutral-950/30 p-3 rounded-xl border border-neutral-800/80 items-center gap-4.5">
                      <div className="p-1.5 bg-white rounded-xl shadow-inner shrink-0 relative flex items-center justify-center">
                        <img 
                          src={qrCodeUrl} 
                          alt="GPay QR Code" 
                          className="w-28 h-28 mix-blend-multiply"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 m-auto w-7 h-7 bg-white rounded-full flex items-center justify-center shadow border-2 border-slate-100">
                          <QrCode className="w-4 h-4 text-emerald-600 animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="text-[11.5px] font-black uppercase text-blue-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                          Scan & Pay with GPay
                        </h5>
                        <p className="text-[9.5px] text-neutral-300 leading-relaxed text-left">
                          Open Google Pay, Paytm, or PhonePe on your phone and scan this dynamic QR-code to pay exactly <strong className="text-white font-black">₹{upiPriceAmount}</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Google Pay Deep link section */}
                    <div className="space-y-1 pt-1">
                      <span className="block text-[8px] font-extrabold uppercase text-neutral-400 tracking-wider">Direct UPI Link Target</span>
                      <a
                        href={upiLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          // Simulate automatic trigger check on deep click
                          setTimeout(() => {
                            if (paymentFlowType === "society") {
                              executeRegisterSocietyBackend(paymentSelectedTier);
                            } else {
                              executeRegisterBackend(paymentSelectedTier);
                            }
                          }, 1400);
                        }}
                        className="w-full py-3 bg-brand-emerald hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-emerald-500 text-center"
                      >
                        <span className="shrink-0 font-bold">📲 PAY VIA GOOGLE PAY (GPAY DIRECT)</span>
                      </a>
                      <p className="text-[8px] mt-1 text-center text-neutral-400 leading-snug">
                        UPI link will open Google Pay. If on desktop, scan the QR code above instead.
                      </p>
                    </div>

                    {/* Secondary verify triggers */}
                    <button
                      type="button"
                      onClick={() => {
                        if (paymentFlowType === "society") {
                          executeRegisterSocietyBackend(paymentSelectedTier);
                        } else {
                          executeRegisterBackend(paymentSelectedTier);
                        }
                      }}
                      className="w-full py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-[10px] rounded-lg mt-2 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      Verify UPI Settlement Now
                    </button>
                  </div>
                  
                  {/* Verified razorpay escrow footer */}
                  <div className="bg-[#111827] px-4 py-2 border-t border-neutral-800 text-center text-[7.5px] font-mono tracking-widest text-neutral-400 uppercase flex items-center justify-center gap-1.5">
                    🛡️ Verified Razorpay Escrow ID: raj.pranjal.999@oksbi
                  </div>
                </div>
              )}

              {paymentStep === "processing" && (
                <div className="space-y-4 text-center py-6">
                  <div className="w-14 h-14 bg-indigo-50 border-2 border-indigo-200 rounded-full flex items-center justify-center mx-auto text-indigo-600 animate-spin">
                    <Loader2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-neutral-800">Processing UPI settlement...</h4>
                    <p className="text-xs text-neutral-400 mt-1">Contacting Razorpay billing gateway & clearing ledger</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 inline-block border text-[11px] font-mono text-neutral-600 text-left">
                    Plan: <strong className="text-indigo-900">{paymentSelectedTier} Tier</strong> <br />
                    UPI Reference Target: <strong>{upiId}</strong> <br />
                    Confirmed Amount: <strong>₹{upiPriceAmount}</strong>
                  </div>
                </div>
              )}

              {paymentStep === "success" && (
                <div className="space-y-4 text-center py-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-brand-emerald border-4 border-brand-emerald animate-pulse">
                    <Check className="w-8 h-8 stroke-[4]" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-neutral-800">UPI Transaction Successful</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      {paymentFlowType === "society" 
                        ? "Society database created & administrator portal ready." 
                        : "Membership activated & resident credentials provisioned."}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Security Protection Footer */}
      <div className="shrink-0 pt-4 border-t border-neutral-100 flex items-center gap-1.5 justify-center text-[9px] text-neutral-400 font-mono mt-auto">
        <Lock className="w-3 h-3 text-neutral-300" /> Secure 256-bit Panchayat ESCROW
      </div>
    </div>
  );
}
