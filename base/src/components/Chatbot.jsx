import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your AI Companion. You can ask me any question or share what's on your mind."
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-chatbot", handleOpen);
    return () => window.removeEventListener("open-chatbot", handleOpen);
  }, []);

  const send = async (customText = null) => {
    const textToSend = customText || input.trim();
    if (!textToSend || loading) return;
    const userMsg = { role: "user", content: textToSend };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke("supportChat", {
        message: userMsg.content,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I am having temporary difficulty connecting. For emergency support, please dial toll-free National Helpline 14566."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#4E36E2] text-white shadow-soft-purple flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40 group"
        aria-label="AI Support Chatbot"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <Bot className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />}
      </button>

      {/* Floating Chat Modal */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-2.5rem)] sm:w-[26rem] h-[32rem] bg-white rounded-[32px] shadow-soft-lg border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-3 duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 bg-white text-[#1E1B4B] flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFA07A] via-[#FF8C68] to-[#4E36E2] text-white flex items-center justify-center shadow-soft-purple font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm leading-tight text-[#1E1B4B]">
                  MindPluze AI Companion
                </p>
                <p className="text-[10px] text-[#4E36E2] flex items-center gap-1 font-bold mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online · 24/7 Crisis Triage
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-[#8E95B2] hover:text-[#1E1B4B] p-1.5 rounded-full hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Starter Chips */}
          <div className="bg-[#F4F6FB] px-4 py-2 flex items-center gap-2 overflow-x-auto border-b border-slate-200/60 text-[11px] font-bold">
            <button
              onClick={() => send("I am feeling anxious and overwhelmed.")}
              className="bg-white hover:bg-[#4E36E2] hover:text-white text-[#1E1B4B] px-3.5 py-1 rounded-full border border-slate-200 transition shrink-0 cursor-pointer shadow-xs"
            >
              Calm panic
            </button>
            <button
              onClick={() => send("How do I contact National Helpline 14566?")}
              className="bg-white hover:bg-[#4E36E2] hover:text-white text-[#1E1B4B] px-3.5 py-1 rounded-full border border-slate-200 transition shrink-0 cursor-pointer shadow-xs"
            >
              14566 Helpline
            </button>
            <button
              onClick={() => send("Explain the Stress Vulnerability Index (SVI).")}
              className="bg-white hover:bg-[#4E36E2] hover:text-white text-[#1E1B4B] px-3.5 py-1 rounded-full border border-slate-200 transition shrink-0 cursor-pointer shadow-xs"
            >
              What is SVI?
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#EEF2F8]/60 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed font-semibold ${
                    m.role === "user"
                      ? "bg-[#4E36E2] text-white rounded-br-none shadow-soft-purple"
                      : "bg-white text-[#1E1B4B] rounded-bl-none shadow-sm border border-slate-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#8E95B2] rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm border border-slate-100 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4E36E2]" />
                  <span className="text-[11px] font-bold">MindPluze is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or express how you feel..."
              className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#4E36E2] focus:ring-2 focus:ring-[#4E36E2]/20 bg-[#F4F6FB]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-[#4E36E2] hover:bg-[#3C28B6] disabled:opacity-40 text-white flex items-center justify-center transition shadow-soft-purple cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}