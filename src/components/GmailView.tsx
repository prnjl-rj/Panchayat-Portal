import React, { useState, useEffect } from "react";
import { initAuth, googleSignIn, getAccessToken, logout } from "../lib/firebase";
import { User } from "firebase/auth";
import { Mail, RefreshCw, LogOut, Send, Inbox, Star, FileText, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function GmailView() {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setToken(token);
        setUser(user);
        setNeedsAuth(false);
        fetchEmails(token);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
        fetchEmails(result.accessToken);
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setToken(null);
    setUser(null);
    setEmails([]);
    setSelectedEmail(null);
    setNeedsAuth(true);
  };

  const fetchEmails = async (accessToken: string) => {
    setIsLoading(true);
    try {
      // Get list of messages
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      
      if (!data.messages) {
        setEmails([]);
        return;
      }

      // Fetch details for each message
      const emailDetails = await Promise.all(
        data.messages.map(async (msg: any) => {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          return await detailRes.json();
        })
      );
      
      setEmails(emailDetails);
    } catch (err) {
      console.error("Error fetching emails:", err);
      // If unauthorized, it might mean token expired or scope lacked
      if (typeof err === "object" && err !== null && "status" in err && (err as any).status === 401) {
        setNeedsAuth(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!composeTo || !composeSubject || !composeBody) {
      alert("Please fill in all fields.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to send this email to ${composeTo}?`);
    if (!confirmed) return;

    setIsSending(true);
    try {
      const emailContent = `To: ${composeTo}\r\nSubject: ${composeSubject}\r\n\r\n${composeBody}`;
      
      const encoder = new TextEncoder();
      const bytes = encoder.encode(emailContent);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Encoded = window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: base64Encoded
        })
      });

      if (!res.ok) {
        throw new Error("Failed to send email");
      }

      setIsComposing(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      alert("Email sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Error sending email");
    } finally {
      setIsSending(false);
    }
  };

  const parseHeader = (headers: any[], name: string) => {
    const header = headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : "Unknown";
  };

  if (needsAuth) {
    return (
      <div className="flex-1 bg-[#F8F9FA] rounded-3xl flex items-center justify-center border border-neutral-200 h-full p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
            <Mail className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">Connect Gmail</h2>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
              Sign in with your Google account to read, send, and manage your emails right inside the app.
            </p>
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button mx-auto w-full max-w-[240px] h-12 flex items-center justify-center bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 active:scale-95 transition-all outline-none"
            style={{ padding: "0 12px" }}
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
            ) : (
              <div className="flex items-center gap-3 w-full pl-2">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span className="text-sm font-semibold text-neutral-600">Sign in with Google</span>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-[#F8F9FA] flex flex-col relative w-full h-full max-w-4xl mx-auto rounded-3xl border border-neutral-200">
      
      {/* Search and Top Bar */}
      <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-neutral-200 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shadow-sm">
            <Mail className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-bold text-[15px] text-neutral-800 leading-tight">Gmail Inbox</h2>
            <p className="text-[11px] text-neutral-500 leading-snug truncate max-w-[150px] sm:max-w-xs">
              {user?.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => token && fetchEmails(token)}
            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors active:scale-95"
            title="Refresh Inbox"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${isLoading ? "animate-spin text-brand-emerald" : ""}`} />
          </button>
          
          {confirmingLogout ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLogout}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Confirm
              </button>
              <button 
                onClick={() => setConfirmingLogout(false)}
                className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setConfirmingLogout(true)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
              title="Sign out of Gmail"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-full pb-16 lg:pb-0">
        
        {/* Sidebar Nav */}
        <div className="hidden sm:flex flex-col w-64 bg-white border-r border-neutral-200 pt-5 px-3">
          <button onClick={() => setIsComposing(true)} className="flex items-center justify-center gap-2 bg-[#C2E7FF] hover:bg-[#b0defb] text-neutral-900 font-medium py-3 px-4 rounded-xl transition-colors shadow-sm mb-6 max-w-[160px]">
            <Send className="w-4.5 h-4.5 text-neutral-700" /> Compose
          </button>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2.5 bg-[#E8F0FE] text-blue-800 rounded-md cursor-pointer font-medium text-sm">
              <div className="flex items-center gap-3">
                <Inbox className="w-4 h-4" /> Inbox
              </div>
              <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full shadow-sm">{emails.length}</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-md cursor-pointer text-sm transition-colors">
              <Star className="w-4 h-4" /> Starred
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-md cursor-pointer text-sm transition-colors">
              <Send className="w-4 h-4" /> Sent
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-md cursor-pointer text-sm transition-colors">
              <FileText className="w-4 h-4" /> Drafts
            </div>
          </div>
        </div>

        {/* Email List Space */}
        <div className="flex-1 overflow-y-auto bg-white relative" style={{ minWidth: "300px" }}>
          {selectedEmail ? (
            <div className="absolute inset-0 z-40 bg-white flex flex-col">
              <div className="flex items-center gap-3 py-3 px-4 border-b border-neutral-200 sticky top-0 bg-white">
                <button type="button" title="Go back to inbox" onClick={() => setSelectedEmail(null)} className="p-2 -ml-2 rounded-xl text-neutral-500 hover:bg-neutral-100 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-800 text-base truncate">
                    {parseHeader(selectedEmail.payload?.headers, "Subject") || "(No Subject)"}
                  </h3>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8E8E8] text-neutral-600 font-bold items-center justify-center flex text-lg">
                    {(parseHeader(selectedEmail.payload?.headers, "From")?.replace(/<.*>/, "").trim() || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-900 text-sm truncate">{parseHeader(selectedEmail.payload?.headers, "From")}</div>
                    <div className="text-xs text-neutral-500">
                      {(() => {
                        const d = new Date(parseHeader(selectedEmail.payload?.headers, "Date"));
                        return isNaN(d.getTime()) ? "" : d.toLocaleString();
                      })()}
                    </div>
                  </div>
                </div>
                <div className="text-neutral-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedEmail.snippet}
                  <br/><br/>
                  <div className="text-xs text-neutral-400 italic bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    This is the snippet preview. Gmail messages are often sent as multipart MIME objects requiring deep traversal to extract full HTML bodies.
                  </div>
                </div>
              </div>
            </div>
          ) : isLoading && emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-300" />
              <p className="text-sm">Loading emails...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-3">
              <Inbox className="w-10 h-10 text-neutral-200" />
              <p className="text-sm">Your inbox is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {emails.map((email: any) => {
                const subject = parseHeader(email.payload?.headers, "Subject") || "(No Subject)";
                const from = parseHeader(email.payload?.headers, "From")?.replace(/<.*>/, "").trim();
                const rawDate = parseHeader(email.payload?.headers, "Date");
                
                const dateObj = new Date(rawDate);
                const isValidDate = !isNaN(dateObj.getTime());
                const isToday = isValidDate && new Date().toDateString() === dateObj.toDateString();
                const displayDate = !isValidDate 
                  ? "" 
                  : isToday 
                    ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })
                    : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

                const isUnread = email.labelIds?.includes('UNREAD');

                return (
                  <div 
                    key={email.id} 
                    onClick={() => setSelectedEmail(email)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors border-l-4 ${isUnread ? 'bg-blue-50/40 border-blue-500' : 'border-transparent'}`}
                  >
                    <div className="hidden sm:flex shrink-0 w-8 h-8 rounded-full bg-[#E8E8E8] text-neutral-600 font-bold items-center justify-center text-xs">
                      {from ? from.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[13px] truncate pr-2 ${isUnread ? 'text-neutral-900 font-bold' : 'text-neutral-700 font-medium'}`}>
                          {from}
                        </span>
                        <span className={`text-[11px] shrink-0 ${isUnread ? 'text-blue-600 font-semibold' : 'text-neutral-500'}`}>
                          {displayDate}
                        </span>
                      </div>
                      <div className={`text-[13px] truncate ${isUnread ? 'text-neutral-800 font-semibold' : 'text-neutral-600'}`}>
                        {subject}
                      </div>
                      <div className="text-[12px] truncate text-neutral-500 mt-0.5">
                        {email.snippet}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-neutral-200">
            <div className="bg-neutral-800 text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-[15px]">New Message</h3>
              <button type="button" aria-label="Close compose window" onClick={() => setIsComposing(false)} className="text-neutral-300 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 border-b border-neutral-100 flex items-center">
              <span className="text-neutral-500 text-[13px] w-16 px-2">To</span>
              <input
                type="email"
                className="flex-1 text-[14px] bg-transparent outline-none py-1"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="p-2 border-b border-neutral-100 flex items-center">
              <span className="text-neutral-500 text-[13px] w-16 px-2">Subject</span>
              <input
                type="text"
                className="flex-1 text-[14px] font-semibold bg-transparent outline-none py-1"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Meeting this weekend"
              />
            </div>
            <div className="p-4 flex-1 h-64 bg-white">
              <textarea
                className="w-full h-full text-[14px] resize-none outline-none leading-relaxed"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your email here..."
              ></textarea>
            </div>
            <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsComposing(false)}
                className="px-4 py-2 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSending || !composeTo || !composeSubject || !composeBody}
                className="px-5 py-2 text-[13px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
