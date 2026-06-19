"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Mouse position for subtle parallax drift
    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 6 floating orbs with gentle drift + breathing + parallax
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      baseR: 200 + Math.random() * 250,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      hue: [255, 275, 240, 265, 285, 250][i],
      alpha: 0.07 + Math.random() * 0.05,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.4 + Math.random() * 0.3,
      parallax: 0.015 + Math.random() * 0.02,
    }));

    let animId: number;
    let t = 0;
    function animate() {
      if (!ctx || !canvas) return;
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouse.x - canvas.width / 2;
      const my = mouse.y - canvas.height / 2;

      for (const o of orbs) {
        // Gentle breathing radius — feels alive, not robotic
        const r = o.baseR + Math.sin(t * o.pulseSpeed + o.pulsePhase) * 18;

        // Subtle parallax toward cursor
        const px = o.x + mx * o.parallax;
        const py = o.y + my * o.parallax;

        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, `hsla(${o.hue}, 70%, 60%, ${o.alpha})`);
        g.addColorStop(0.6, `hsla(${o.hue}, 70%, 60%, ${o.alpha * 0.35})`);
        g.addColorStop(1, `hsla(${o.hue}, 70%, 60%, 0)`);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        o.x += o.dx;
        o.y += o.dy;
        if (o.x < -o.baseR) o.x = canvas.width + o.baseR;
        if (o.x > canvas.width + o.baseR) o.x = -o.baseR;
        if (o.y < -o.baseR) o.y = canvas.height + o.baseR;
        if (o.y > canvas.height + o.baseR) o.y = -o.baseR;
      }
      animId = requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener("resize", resizeCanvas);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#06060a] text-white overflow-x-hidden antialiased selection:bg-indigo-500/30">
      {/* Animated canvas — fixed opacity removed, alpha now baked into orb values */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Structural grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10">

        {/* ── Navbar ── */}
        <header className="w-full px-8 py-5 border-b border-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black tracking-tight text-white">
              summify<span className="text-indigo-500">.</span>
            </span>

            <div className="hidden md:flex items-center gap-10 text-sm font-semibold tracking-wide text-slate-400">
              <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
              <a href="#how" className="hover:text-white transition-colors duration-200">How it works</a>
            </div>

            <Link
              href="/analyze"
              className="bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <main className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center relative">

          <div className="inline-flex items-center gap-2.5 border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 px-4 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-12">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI Meeting Intelligence
          </div>

          {/* Headline — fixed: stroke text now has solid fallback for Firefox */}
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.92] mb-10">
            Your meetings. <br />
            <span className="font-serif italic font-normal text-indigo-400 pr-2">understood</span> <br />
            <span
              className="block font-normal mt-3 tracking-wide text-white md:text-transparent"
              style={{ WebkitTextStroke: "2px #ffffff", paintOrder: "stroke fill" }}
            >
              instantly.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
            Drop a YouTube link or upload any audio recording. Summify transcribes{" "}
            <span className="text-white font-semibold">locally via Whisper</span>, extracts deep
            insights, and builds an index so you can{" "}
            <span className="text-indigo-400 font-semibold">chat directly with your content</span>.
          </p>

          {/* CTAs — fixed: bg-gray-300 → bg-white to match outline CTA consistency */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
            <Link
              href="/analyze"
              className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-10 py-4 rounded-full text-base transition-all duration-200 shadow-2xl shadow-indigo-500/10 hover:-translate-y-0.5"
            >
              Analyze a Meeting
            </Link>
            <a
              href="#features"
              className="border border-slate-800 bg-slate-950/60 text-slate-300 font-bold px-10 py-4 rounded-full text-base hover:bg-slate-900 hover:text-white transition-all duration-200"
            >
              See how it works
            </a>
          </div>

          <p className="text-xs text-slate-600 font-bold tracking-[0.2em] uppercase mb-20">
            Free · No sign-in required · 100% Local Privacy
          </p>

          {/* ── Floating preview cards ── */}
          <div className="flex items-end justify-center gap-6 max-w-4xl mx-auto">

            <div className="hidden lg:block w-64 text-left transform -rotate-3 translate-y-6 transition-transform duration-300 hover:rotate-0">
              <div className="bg-[#0c0c14] border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-black/80">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-400 mb-3">📋 Summary</p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Team reviewed Q2 sprint progress. Backend APIs are 90% complete. Design handoff
                  blocked pending stakeholder approval…
                </p>
                <div className="mt-4 flex items-center gap-2 text-emerald-400 font-bold text-[11px] tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Generated
                </div>
              </div>
            </div>

            <div className="bg-[#0b0b12] border-2 border-indigo-500/20 rounded-2xl p-6 w-80 md:w-96 shadow-2xl shadow-indigo-500/5 relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500/40" />

              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg">🎙️</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">Team Standup · June</div>
                  <div className="text-xs text-slate-500 font-medium">32 min · Local Whisper Pipeline</div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2.5">
                  <span className="text-emerald-400 text-xs font-bold">✓</span>
                  <span className="text-xs text-slate-400 font-medium">Priya — share mockups by Friday</span>
                </div>
                <div className="flex items-center gap-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2.5">
                  <span className="text-emerald-400 text-xs font-bold">✓</span>
                  <span className="text-xs text-slate-400 font-medium">Dev — unblock login API by EOD</span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <div className="bg-indigo-600 border border-indigo-500 rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs text-white font-medium text-right max-w-[85%] ml-auto">
                  What was decided about the API?
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs text-slate-400 font-medium max-w-[85%]">
                  The team agreed to unblock the login API by end of day.
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-64 text-left transform rotate-3 translate-y-6 transition-transform duration-300 hover:rotate-0">
              <div className="bg-[#0c0c14] border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-black/80">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-400 mb-4">🔑 Key Decisions</p>
                <div className="space-y-3 font-medium">
                  {[
                    "Ship v2 by end of month",
                    "Postpone mobile app to Q3",
                    "Hire 2 backend engineers",
                  ].map((decisionText) => (
                    <div key={decisionText} className="flex items-start gap-2.5">
                      <span className="text-slate-700 text-xs mt-0.5">—</span>
                      <span className="text-xs text-slate-400 leading-normal">{decisionText}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── Trust bar ── */}
        <div className="border-t border-slate-900 py-6 mt-12 bg-[#06060a]/40 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-8 flex-wrap text-xs text-slate-600 font-bold tracking-[0.2em] uppercase">
            <span>Whisper</span>
            <span>•</span>
            <span>Mistral AI</span>
            <span>•</span>
            <span>ChromaDB</span>
            <span>•</span>
            <span>LangChain</span>
          </div>
        </div>

        {/* ── Features ── */}
        <section id="features" className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
              Built for real meetings.
            </h2>
            <p className="text-slate-500 text-base max-w-sm mx-auto font-medium">
              Everything extracted automatically. Zero cloud dependencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "🔒", title: "100% Private", sub: "Local transcription", desc: "Whisper runs entirely on your machine. Your audio never leaves your local workspace." },
              { icon: "📋", title: "Smart Extraction", sub: "Summary + actions + decisions", desc: "Automatically pulls out summaries, action items, and key decisions from any meeting." },
              { icon: "🌐", title: "Hindi → English", sub: "Hinglish support", desc: "Mixed Hindi-English meetings are translated into clean English transcripts automatically." },
              { icon: "💬", title: "Chat with Transcript", sub: "RAG-powered Q&A", desc: "Ask any question about your meeting. Answers grounded directly in your transcript." },
            ].map((featureItem) => (
              <div key={featureItem.title} className="bg-[#09090f] border border-slate-900 rounded-2xl p-6 hover:border-indigo-500/20 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="text-2xl mt-0.5">{featureItem.icon}</div>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-2 mb-2">
                      <h3 className="font-bold text-white text-sm tracking-tight">{featureItem.title}</h3>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{featureItem.sub}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{featureItem.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="max-w-5xl mx-auto px-6 pb-32">
          <div className="bg-[#09090f] border border-slate-900 rounded-3xl px-8 py-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 130%, rgba(99,102,241,0.07), transparent 55%)" }} />
            <div className="relative z-10">
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.2em] mb-4">Get started today</p>
              <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                Summarize your recordings <br />
                <span className="text-slate-500 font-normal font-serif italic">in under 5 minutes.</span>
              </h2>
              <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto font-medium">
                No account. No credit card. Just paste a YouTube link.
              </p>
              <Link
                href="/analyze"
                className="inline-block bg-white hover:bg-slate-100 text-slate-950 font-bold px-10 py-4 rounded-full text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-2xl shadow-black"
              >
                Start Analyzing Free →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}