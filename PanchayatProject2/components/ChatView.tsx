import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Send, RefreshCw, MessageCircle } from "lucide-react";
import { ChatMessage, AppUser } from "../types";

interface ChatViewProps {
  currentUser: AppUser;
  societyId: string;
}

export default function ChatView({ currentUser, societyId }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat?societyId=${societyId}`, {
        headers: { "x-society-id": societyId }
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling every 5 sec
    return () => clearInterval(interval);
  }, [societyId]);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-society-id": societyId 
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderFlat: currentUser.flatNumber,
          text: inputText.trim()
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      setInputText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Group messages by date
  const groupedMessages: Record<string, ChatMessage[]> = {};
  messages.forEach(msg => {
    const dateStr = new Date(msg.timestamp).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    if (!groupedMessages[dateStr]) groupedMessages[dateStr] = [];
    groupedMessages[dateStr].push(msg);
  });

  return (
    <div className="flex-1 overflow-hidden bg-[#EFEAE2] flex flex-col relative w-full h-full max-w-2xl mx-auto rounded-3xl pb-[82px] border border-neutral-200">
      
      {/* App-like Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex flex-col items-center justify-center font-bold relative text-white">
            <MessageCircle className="w-5 h-5 absolute" />
          </div>
          <div>
            <h2 className="font-bold text-[15px] leading-tight">Society Community Group</h2>
            <p className="text-[11px] text-white/80 leading-snug">
              {currentUser.name}, {currentUser.flatNumber}
            </p>
          </div>
        </div>
        <button 
          onClick={fetchMessages}
          className="p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95"
          title="Refresh Messages"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading && !isSending ? "animate-spin text-[#25D366]" : "text-white/80"}`} />
        </button>
      </div>

      {/* Chat messages area */}
      {/* Background patterned overlay (simulated) */}
      <div className="absolute inset-0 top-[60px] opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar relative z-0 flex flex-col pt-6 pb-20">
        {messages.length === 0 && !isLoading && (
          <div className="text-center p-4 bg-white/60 mx-auto rounded-xl text-neutral-600 text-xs shadow-sm max-w-[240px]">
            Welcome to the Society Chat! Say hello to your neighbors.
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="relative w-full">
            <div className="sticky top-2 z-10 flex justify-center mb-4">
              <span className="text-[10px] font-bold px-3 py-1 bg-[#E1F3FB] text-slate-600 rounded-lg shadow-sm">
                {date}
              </span>
            </div>
            
            <div className="space-y-3">
              {msgs.map((msg, index) => {
                const isMine = msg.senderId === currentUser.id;
                
                // Check if previous message was from the same person to group them
                const prevMsg = index > 0 ? msgs[index - 1] : null;
                const isSameSenderAsPrev = prevMsg && prevMsg.senderId === msg.senderId;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex flex-col relative max-w-[85%] ${isMine ? "ml-auto items-end" : "mr-auto items-start"} ${isSameSenderAsPrev ? "mt-1" : "mt-3"}`}
                  >
                    {!isMine && !isSameSenderAsPrev && (
                      <span className="text-[10px] font-bold text-emerald-700 ml-1 mb-0.5 flex items-center gap-1">
                        {msg.senderName} <span className="opacity-50 font-normal">({msg.senderFlat})</span>
                      </span>
                    )}

                    <div className={`px-3 py-2 text-[14px] leading-relaxed relative shadow-sm ${
                      isMine 
                        ? "bg-[#D9FDD3] text-[#111B21] rounded-l-lg rounded-br-none rounded-tr-lg" 
                        : "bg-white text-[#111B21] rounded-r-lg rounded-bl-none rounded-tl-lg"
                    }`}>
                      {msg.text}
                      
                      {/* Timestamp corner */}
                      <span className={`text-[9px] float-right mt-2 ml-3 opacity-60 relative top-1`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer area */}
      <div className="absolute bottom-0 left-0 right-0 p-2 z-20 pb-20 sm:pb-3 w-full bg-transparent">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-2xl mx-auto items-end relative w-full px-2">
          <div className="flex-1 bg-white rounded-3xl min-h-[44px] flex items-center px-4 shadow-sm relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent border-none outline-none text-[15px] text-neutral-800 placeholder:text-neutral-400 py-3"
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            title="Send message"
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all focus:outline-none ${
              inputText.trim() ? "bg-[#00A884] text-white hover:bg-[#008f6f] active:scale-95" : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>

    </div>
  );
}
