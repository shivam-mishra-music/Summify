"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { processURL, processFile } from "../lib/api";

type InputMode = "url" | "file";
type Language = "english" | "hinglish";

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>("english");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      let result;
      if (mode === "url") {
        if (!url.trim()) throw new Error("Please enter a YouTube URL.");
        result = await processURL(url.trim(), language);
      } else {
        if (!file) throw new Error("Please select an audio or video file.");
        result = await processFile(file, language);
      }
      sessionStorage.setItem("summify_result", JSON.stringify(result));
      router.push("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-white antialiased flex flex-col">
      {/* Grid background */}
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
        <header className="w-full px-8 py-5 flex items-center justify-between border-b border-slate-900/80">
          <Link href="/" className="text-xl font-black tracking-tight text-white">
            summify<span className="text-indigo-500">.</span>
          </Link>
          <span className="text-[11px] text-slate-500 font-bold tracking-[0.2em] uppercase">
            New Analysis
          </span>
        </header>

        {/* Centered content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Badge + title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 border border-indigo-500/25 bg-indigo-500/8 text-indigo-400 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI Analysis
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
              Analyze your meeting
            </h1>
            <p className="text-slate-400 text-[15px] font-medium">
              Paste a YouTube link or upload an audio recording.
            </p>
          </div>

          {/* Card */}
          <div className="w-full max-w-lg bg-[#0c0c14] border border-slate-800/80 rounded-2xl p-7 shadow-2xl shadow-black/70">

            {/* Mode toggle */}
            <div className="flex bg-[#08080f] border border-slate-800/60 rounded-xl p-1 mb-6 gap-1">
              {(["url", "file"] as InputMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); }}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-200 ${
                    mode === m
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {m === "url" ? "🔗 YouTube URL" : "📁 Upload File"}
                </button>
              ))}
            </div>

            {/* URL input */}
            {mode === "url" && (
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#08080f] border border-slate-700/80 rounded-xl px-4 py-3 text-[13px] text-white placeholder-slate-700 font-medium focus:outline-none focus:border-indigo-500/50 focus:bg-[#0a0a12] transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            )}

            {/* File upload */}
            {mode === "file" && (
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase mb-2">
                  Audio / Video File
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragOver
                      ? "border-indigo-500/60 bg-indigo-500/5"
                      : file
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-slate-800 hover:border-indigo-500/35 hover:bg-slate-900/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.webm,.ogg"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  />
                  {file ? (
                    <>
                      <div className="text-2xl mb-2">✅</div>
                      <p className="text-[13px] font-bold text-emerald-400 truncate max-w-xs mx-auto">{file.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        {(file.size / 1024 / 1024).toFixed(1)} MB · Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl mb-2">🎙️</div>
                      <p className="text-[13px] font-bold text-white mb-0.5">Drop your file here</p>
                      <p className="text-[11px] text-slate-500 font-medium">MP3, MP4, WAV, M4A, WebM · or click to browse</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Language selector */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-slate-500 tracking-[0.15em] uppercase mb-2">
                Language
              </label>
              <div className="flex gap-2">
                {(["english", "hinglish"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border transition-all duration-200 ${
                      language === lang
                        ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                        : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    {lang === "english" ? "🌐 English" : "🇮🇳 Hinglish"}
                  </button>
                ))}
              </div>
              {language === "hinglish" && (
                <p className="text-[11px] text-slate-600 mt-2 font-medium">
                  Uses Sarvam AI to translate Hindi-English mixed audio → English.
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-[13px] text-red-400 font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800/80 disabled:text-slate-600 text-white font-bold py-3.5 rounded-xl text-[14px] transition-all duration-200 shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 hover:-translate-y-px disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analyzing — this may take a minute…
                </span>
              ) : (
                "Analyze Meeting →"
              )}
            </button>

            <p className="text-center text-[11px] text-slate-700 mt-3 font-medium">
              Runs locally on your machine · No data sent to third parties
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex items-center gap-3 mt-6">
            {[
              { icon: "📋", label: "Summary" },
              { icon: "✅", label: "Action Items" },
              { icon: "🔑", label: "Key Decisions" },
              { icon: "💬", label: "Chat with it" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 bg-[#0c0c14] border border-slate-800/60 rounded-full px-3 py-1.5"
              >
                <span className="text-xs">{item.icon}</span>
                <span className="text-[11px] text-slate-500 font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}