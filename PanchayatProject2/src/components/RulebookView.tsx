import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  BookOpen, 
  Send, 
  HelpCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  MessageSquare,
  CornerDownLeft,
  CalendarDays,
  ShieldCheck
} from "lucide-react";
import { SOCIETY_RULES } from "../data";

interface RuleQuery {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

interface RulebookViewProps {
  onAskAI: (question: string) => Promise<{ answer: string; isMock?: boolean; tip?: string }>;
  societyRules: import('../types').SocietyRule[];
  societyName: string;
}

export default function RulebookView({ onAskAI, societyRules, societyName }: RulebookViewProps) {
  // Navigation: chatbot vs bylaws
  const [subMode, setSubMode] = useState<'chat' | 'bylaws'>('chat');
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<RuleQuery[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested questions
  const samplePills = [
    "Till when is the gym open?",
    "Can we do parties in community hall?",
    "Pool details on Mondays?",
    "Fine for leaving pet waste?",
    "Drill hours for renovations?"
  ];

  // Scroll to bottom helper
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isSearching]);

  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim()) return;

    const currentQuestion = questionText;
    setIsSearching(true);
    setInputText('');

    try {
      const response = await onAskAI(currentQuestion);
      
      const newQuery: RuleQuery = {
        id: `q-${Date.now()}`,
        question: currentQuestion,
        answer: response.answer,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, newQuery]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSection = (idx: number) => {
    setExpandedSection(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-4 pb-8 flex flex-col min-h-0">
      {/* Visual Header */}
      <div className="text-center space-y-1 shrink-0">
        <h2 className="font-display font-bold text-lg text-neutral-800">Rulebook & AI Butler</h2>
        <p className="text-xs text-neutral-500 max-w-[280px] mx-auto">
          Read {societyName} guidelines or ask Panchayat AI to analyze terms instantly.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl shrink-0">
        <button
          onClick={() => setSubMode('chat')}
          className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subMode === 'chat' 
              ? "bg-white text-indigo-800 shadow" 
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-indigo-700" /> Ask AI Chatbot
        </button>
        <button
          onClick={() => setSubMode('bylaws')}
          className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            subMode === 'bylaws' 
              ? "bg-white text-indigo-800 shadow" 
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-700" /> Read Bylaws book
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 min-h-0 bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {subMode === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chats Scrolling section */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  {/* Decorative AI Logo */}
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 relative">
                    <Sparkles className="w-7 h-7 text-indigo-700 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
                  </div>

                  <div className="space-y-1.5 max-w-[260px]">
                    <h4 className="font-display font-bold text-sm text-neutral-800">Panchayat Resident Assistant</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      "Hello! I am your society AI Butler. Ask me anything about timings, fines, parties, pets or maintenance rules."
                    </p>
                  </div>

                  {/* Suggestion pills container card */}
                  <div className="space-y-2.5 pt-4 w-full">
                    <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider font-mono">Suggested Inquiries</p>
                    <div className="flex flex-wrap justify-center gap-1.5 px-2">
                      {samplePills.map(p => (
                        <button
                          key={p}
                          onClick={() => handleAskQuestion(p)}
                          className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-[10.5px] font-semibold text-neutral-600 hover:text-neutral-800 border border-neutral-100 hover:border-neutral-200 transition-all text-xs text-left"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map(item => (
                    <div key={item.id} className="space-y-3">
                      {/* User Bubble */}
                      <div className="flex justify-end pl-10">
                        <div className="bg-neutral-100 border border-neutral-200 text-neutral-800 px-3.5 py-2.5 rounded-2xl rounded-tr-none text-xs font-medium">
                          {item.question}
                        </div>
                      </div>

                      {/* AI Response Bubble */}
                      <div className="flex justify-start pr-8">
                        <div className="bg-indigo-50 border border-indigo-100 text-neutral-800 p-3.5 rounded-2xl rounded-tl-none space-y-2">
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-700 hover:rotate-12 transition-transform" />
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-indigo-800">Panchayat AI</span>
                          </div>
                          
                          <p className="text-xs font-sans leading-relaxed text-neutral-800 whitespace-pre-line">
                            {item.answer}
                          </p>

                          <div className="text-[9px] text-neutral-400 font-mono flex items-center justify-between border-t border-indigo-100/50 pt-1.5">
                            <span>Sourced from Bylaws</span>
                            <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loader during query processing */}
              {isSearching && (
                <div className="flex justify-start pr-12">
                  <div className="bg-neutral-50 border border-neutral-100 p-3.5 rounded-2xl rounded-tl-none space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-brand-emerald font-bold animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-bounce delay-200" />
                      <span>Searching Society Bylaws...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form field at the base */}
            <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion(inputText)}
                disabled={isSearching}
                placeholder="Ask e.g. till when is the gym open?"
                className="flex-1 bg-white border border-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs focus:outline-none placeholder-neutral-400 font-sans"
              />
              <button
                type="button"
                onClick={() => handleAskQuestion(inputText)}
                disabled={!inputText.trim() || isSearching}
                aria-label="Send question"
                className="p-2.5 bg-brand-emerald hover:bg-indigo-800 rounded-xl text-white transition-colors disabled:opacity-50 active:scale-95 cursor-pointer shadow-sm shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Reader bellows tab */
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
            <div className="bg-amber-50/30 border border-amber-200/50 rounded-xl p-3 flex gap-2 mb-1 shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-800 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-bold text-xs text-indigo-900">Official Society Bylaws</h4>
                <p className="text-[10px] text-indigo-800/80 leading-normal font-sans mt-0.5">
                  {societyName} Cooperative Housing guidelines compiled in compliance with the State Housing Act of 1972. All members must conform.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {(societyRules.length > 0 ? societyRules : SOCIETY_RULES).map((rule, idx) => {
                const isExpanded = expandedSection === idx;

                return (
                  <div 
                    key={idx}
                    className="border border-neutral-100 rounded-xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full px-4 py-3 bg-neutral-50/60 hover:bg-neutral-50 transition-colors flex items-center justify-between text-left cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 font-mono tracking-wider uppercase">{rule.category}</span>
                        <h4 className="text-xs font-bold text-neutral-800 font-display mt-0.2">{rule.title}</h4>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-white"
                        >
                          <div className="p-4 border-t border-neutral-100 text-xs text-neutral-600 font-sans leading-relaxed">
                            {rule.detail}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tiny diagnostics line info */}
      <div className="p-3 bg-neutral-50 border border-neutral-100 text-center flex items-center justify-center gap-1.5 text-[9.5px] text-neutral-400 font-mono rounded-xl shrink-0">
        <Cpu className="w-3.5 h-3.5 text-brand-emerald" />
        <span>SOCIETY AI INDEXED TO GEMINI-3.5-FLASH</span>
      </div>
    </div>
  );
}
