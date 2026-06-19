"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { chatWithMeeting, type ProcessResult } from "../lib/api";

type Tab = "summary" | "actions" | "decisions" | "questions" | "transcript";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "summary",    label: "Summary",        icon: "📋" },
  { id: "actions",    label: "Action Items",   icon: "✅" },
  { id: "decisions",  label: "Key Decisions",  icon: "🔑" },
  { id: "questions",  label: "Open Questions", icon: "❓" },
  { id: "transcript", label: "Transcript",     icon: "📄" },
];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const numMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-3 text-[13px] text-slate-300 font-medium leading-relaxed">
              <span className="text-indigo-400 font-bold min-w-[1.25rem] flex-shrink-0">{numMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: numMatch[2].replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
            </div>
          );
        }
        if (line.match(/^[-•*]\s+/)) {
          const content = line.replace(/^[-•*]\s+/, "");
          return (
            <div key={i} className="flex gap-2.5 text-[13px] text-slate-300 font-medium leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500/60 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
            </div>
          );
        }
        if (/^\*\*(.+)\*\*$/.test(line)) {
          return <p key={i} className="text-[13px] font-bold text-white mt-4 first:mt-0">{line.replace(/\*\*/g, "")}</p>;
        }
        return (
          <p key={i}
            className="text-[13px] text-slate-300 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }}
          />
        );
      })}
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("summify_result");
    if (!stored) { router.replace("/analyze"); return; }
    setResult(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!question.trim() || !result || chatLoading) return;
    const q = question.trim();
    setQuestion("");
    setChatError(null);
    setMessages((m) => [...m, { role: "user", text: q }]);
    setChatLoading(true);
    try {
      const res = await chatWithMeeting(result.session_id, q);
      setMessages((m) => [...m, { role: "assistant", text: res.answer }]);
    } catch (err: unknown) {
      setChatError(err instanceof Error ? err.message : "Chat failed.");
    } finally {
      setChatLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading results…
        </div>
      </div>
    );
  }

  const tabContent: Record<Tab, string> = {
    summary:    result.summary,
    actions:    result.action_items,
    decisions:  result.key_decisions,
    questions:  result.open_questions,
    transcript: result.transcript,
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-white antialiased flex flex-col">
      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <header className="w-full px-8 py-5 flex items-center justify-between border-b border-slate-900/80 flex-shrink-0">
          <Link href="/" className="text-xl font-black tracking-tight text-white">
            summify<span className="text-indigo-500">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-[12px] text-slate-500 font-semibold truncate max-w-xs">
              {result.title}
            </span>
            <Link
              href="/analyze"
              className="text-[12px] font-bold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 px-4 py-2 rounded-full transition-all"
            >
              + New Analysis
            </Link>
          </div>
        </header>

        {/* Page body */}
        <div className="flex-1 flex flex-col px-6 md:px-8 py-6 gap-5 min-h-0">
          {/* Title row */}
          <div className="flex items-start gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            </div>
            <div>
              <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-1">Analysis Complete</p>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">{result.title}</h1>
            </div>
          </div>

          {/* Two-column layout — fills remaining height */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-5 min-h-0">

            {/* ── Left: Tabbed analysis panel ── */}
            <div className="xl:col-span-3 flex flex-col min-h-0 bg-[#0c0c14] border border-slate-800/80 rounded-2xl overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-slate-800/80 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-3.5 text-[12px] font-bold tracking-wide whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-white"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "transcript" ? (
                  <pre className="font-mono text-[12px] text-slate-400 leading-relaxed whitespace-pre-wrap bg-slate-900/40 rounded-xl p-4 border border-slate-800/60">
                    {result.transcript}
                  </pre>
                ) : (
                  <MarkdownText text={tabContent[activeTab]} />
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-slate-900 flex items-center justify-between flex-shrink-0">
                <span className="text-[11px] text-slate-600 font-medium">
                  {TABS.find((t) => t.id === activeTab)?.icon} {TABS.find((t) => t.id === activeTab)?.label}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(tabContent[activeTab])}
                  className="text-[11px] text-slate-500 hover:text-white font-bold transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* ── Right: Chat panel ── */}
            <div className="xl:col-span-2 flex flex-col min-h-0 bg-[#0c0c14] border border-slate-800/80 rounded-2xl overflow-hidden">
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-slate-800/80 flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0">
                  💬
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">Chat with this meeting</p>
                  <p className="text-[11px] text-slate-500 font-medium">Ask anything about the transcript</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="text-2xl mb-2">🤖</div>
                    <p className="text-[12px] text-slate-500 font-medium mb-4">
                      Ask me anything about the meeting.
                    </p>
                    <div className="space-y-2 text-left">
                      {[
                        "What were the main decisions?",
                        "Who owns the action items?",
                        "What questions remain open?",
                      ].map((hint) => (
                        <button
                          key={hint}
                          onClick={() => setQuestion(hint)}
                          className="w-full text-left text-[12px] text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2.5 font-medium transition-all"
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[12px] font-medium leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 border border-indigo-500/80 text-white rounded-tr-sm"
                          : "bg-slate-900/70 border border-slate-800 text-slate-300 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {chatError && (
                  <p className="text-[12px] text-red-400 font-medium text-center">{chatError}</p>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-800/80 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask about the meeting…"
                    className="flex-1 bg-[#08080f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-[12px] text-white placeholder-slate-700 font-medium focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={chatLoading || !question.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 rounded-xl text-[12px] font-bold transition-all disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}