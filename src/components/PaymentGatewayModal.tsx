import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building, 
  QrCode, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Receipt,
  Download,
  Printer,
  ChevronRight
} from "lucide-react";
import { ServiceRequest } from "../types";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onPaySuccess: (requestId: string, paymentMethod: 'UPI' | 'Card' | 'NetBanking', amount: number) => Promise<void>;
}

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  request,
  onPaySuccess
}: PaymentGatewayModalProps) {
  const [payMethod, setPayMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<'details' | 'otp' | 'success'>('details');

  // Input Fields State
  const [upiId, setUpiId] = useState("resident.greenwood@okaxis");
  const [cardNumber, setCardNumber] = useState("4532 9845 2314 8854");
  const [cardExpiry, setCardExpiry] = useState("12/29");
  const [cardCvv, setCardCvv] = useState("334");
  const [cardName, setCardName] = useState("Sneha Reddy");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // OTP Fields
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [generatedTxnId, setGeneratedTxnId] = useState("");

  const baseAmount = request?.amount || 199;
  const convenienceFee = 15;
  const gstAmount = Math.round(baseAmount * 0.18);
  const grandTotal = baseAmount + convenienceFee + gstAmount;

  // Cleanup states on open
  useEffect(() => {
    if (isOpen) {
      setPaymentPhase('details');
      setIsProcessing(false);
      setOtpCode("");
      setOtpError("");
    }
  }, [isOpen]);

  if (!isOpen || !request) return null;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate securing transaction token
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentPhase('otp');
    }, 1500);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setOtpError("Verify with a valid 4-digit security code.");
      return;
    }
    
    setIsProcessing(true);
    setOtpError("");

    try {
      // Execute the actual server dispatch securely
      await onPaySuccess(request.id, payMethod, grandTotal);
      
      // Simulate transaction completed successfully
      setPaymentPhase('success');
    } catch (err) {
      setOtpError("Secure verification failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs select-none">
        
        {/* Modal Sheet Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-slate-800 text-white w-full max-w-[395px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-300">
                  Secure Gateway
                </h3>
              </div>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="p-1.5 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-4.5 h-4.5 text-slate-400" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto no-scrollbar space-y-4 flex-1 max-h-[70vh]">
            
            {/* General SSL Security Seal */}
            {paymentPhase !== 'success' && (
              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-2.5 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-indigo-200 font-bold font-mono">256-BIT SSL CERTIFIED GATEWAY</p>
                  <p className="text-[9px] text-slate-400 leading-none">Sandbox Mode: End-to-end encrypted PCI compliance</p>
                </div>
              </div>
            )}

            {/* PHASE 1: DETAILS */}
            {paymentPhase === 'details' && (
              <div className="space-y-4">
                
                {/* Billing Summary Box */}
                <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Service Charge Fee</span>
                    <span className="text-[11.5px] font-mono font-semibold text-slate-300">₹{baseAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Convenience Fee</span>
                    <span className="text-slate-300 font-mono">₹{convenienceFee}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">GST (18% SGST/CGST)</span>
                    <span className="text-slate-300 font-mono">₹{gstAmount}</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-slate-800 my-1 pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-indigo-300 font-mono font-extrabold uppercase uppercase">Payable Total</span>
                    <span className="text-sm font-extrabold font-mono text-amber-300">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Method Tabs selectors */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/60">
                  <button
                    onClick={() => setPayMethod('UPI')}
                    className={`py-1.5 rounded-lg text-[9.5px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                      payMethod === 'UPI' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" /> UPI
                  </button>
                  <button
                    onClick={() => setPayMethod('Card')}
                    className={`py-1.5 rounded-lg text-[9.5px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                      payMethod === 'Card' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> CARD
                  </button>
                  <button
                    onClick={() => setPayMethod('NetBanking')}
                    className={`py-1.5 rounded-lg text-[9.5px] font-mono font-bold transition-all flex items-center justify-center gap-1 ${
                      payMethod === 'NetBanking' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" /> BANKING
                  </button>
                </div>

                {/* Form based on selected method */}
                <form onSubmit={handleDetailsSubmit} className="space-y-3.5">
                  {payMethod === 'UPI' && (
                    <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800/50 flex flex-col items-center">
                      {/* Interactive Visual UPI Scan QR */}
                      <div className="w-24 h-24 bg-white p-1 rounded-xl shadow mt-1 relative flex items-center justify-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=greenwoodheights@axis%26pn=GreenwoodHeights%26am=${grandTotal}%26cu=INR`} 
                          alt="UPI QR Code" 
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center pointer-events-none" />
                      </div>
                      <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">
                        Scan with GPay, PhonePe or BHIM
                      </span>

                      <div className="w-full space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">UPI ID (VPA)</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g., username@okaxis"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {payMethod === 'Card' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                          placeholder="4532 9845 2314 8854"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Expiry Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            maxLength={5}
                            placeholder="MM/YY"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">CVV Pin</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            maxLength={3}
                            placeholder="***"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono text-center tracking-widest"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Enter your card name"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {payMethod === 'NetBanking' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-400 font-bold">Preferred Bank</label>
                        <select
                          title="Select your preferred bank"
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Submit Details checkouts */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-display tracking-wide transition-all shadow-md mt-2 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" /> Securely Bundling token...
                      </>
                    ) : (
                      <>Proceed Securely to OTP Verification</>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* PHASE 2: SECURE OTP */}
            {paymentPhase === 'otp' && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
                  <Smartphone className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                  <h4 className="text-xs font-bold font-display">Confirm 3D-Secure Authentication</h4>
                  <p className="text-[10.5px] text-slate-400 leading-normal max-w-xs mx-auto">
                    A secure 4-digit security authentication OTP has been dispatched to your mobile linked with payment reference for <b>{request.staffName}</b> booking.
                  </p>
                </div>

                <form onSubmit={verifyOtp} className="space-y-3">
                  {otpError && (
                    <div className="bg-red-950/40 border border-red-500/20 text-red-300 p-2 rounded-xl text-[10.5px] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-slate-400 font-bold block text-center">
                      Enter Security OTP Token
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1234"
                      className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base text-center font-mono focus:outline-none focus:border-indigo-500 mx-auto block tracking-widest text-[#f59e0b]"
                    />
                    <p className="text-[9px] text-slate-500 text-center font-mono mt-1">Hint: Type any 4-digit code (e.g., 4004)</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-brand-emerald text-white rounded-xl text-xs font-bold font-display tracking-wide transition-all shadow-md mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" /> Executing PCI Settlement...
                      </>
                    ) : (
                      <>Authenticate & Pay ₹{grandTotal}</>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* PHASE 3: SUCCESS SUCCESS */}
            {paymentPhase === 'success' && (
              <div className="space-y-4 text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto stroke-[2.5] animate-scale-up" />
                
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-display text-emerald-400">Payment Authorization Success!</h4>
                  <p className="text-[10.5px] text-slate-300 max-w-xs mx-auto">
                    The settlement transaction was successfully finalized. Outstanding ledger has been securely cleared.
                  </p>
                </div>

                {/* Simulated Receipt Details */}
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-left space-y-2.5 font-mono text-[10.5px]">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-900 pb-2">
                    <span className="font-bold flex items-center gap-1 text-slate-300">
                      <Receipt className="w-3.5 h-3.5 text-indigo-400" /> OFFICIAL RECEIPT
                    </span>
                    <span className="text-slate-500 text-[9px]">GREENWOOD CO-OP</span>
                  </div>
                  
                  <div className="space-y-1.5 text-slate-400 text-[10px]">
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="text-slate-200">TXN{Math.floor(Math.random() * 900000 + 100000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Staff:</span>
                      <span className="text-slate-200">{request.staffName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="text-slate-200">{request.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resident Allocation:</span>
                      <span className="text-slate-200">{request.flatNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Settlement Date:</span>
                      <span className="text-slate-200">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="text-slate-200">{payMethod}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex justify-between font-bold text-slate-200">
                    <span>Total Settled:</span>
                    <span className="text-amber-400">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Print Invoice/Receipt buttons */}
                <div className="flex items-center justify-between gap-2.5">
                  <button 
                    onClick={() => {
                      alert("Simulating PDF statement compilation...");
                    }}
                    className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl text-[10px] text-slate-300 font-bold font-mono tracking-wide flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" /> DL STATEMENT
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl text-[10px] text-slate-300 font-bold font-mono tracking-wide flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-400" /> PRINT RECEIPT
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-display transition-colors cursor-pointer mt-2"
                >
                  Return to Bookings
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
