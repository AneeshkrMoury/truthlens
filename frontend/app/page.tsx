"use client";
import { useState, useEffect, useRef } from "react";

const gradientText = "bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent";

type SentenceResult = {
  sentence: string;
  ai_score: number;
  label: string;
  color: string;
};

type TextResult = {
  verdict: string;
  verdict_color: string;
  confidence: number;
  ai_score: number;
  real_score: number;
  sentences: SentenceResult[];
  characters_analyzed: number;
  disclaimer: string;
  error?: string;
};

type ImageResult = {
  verdict: string;
  verdict_color: string;
  confidence: number;
  ai_score: number;
  real_score: number;
  image_type: string;
  explanation: string;
  confidence_note: string;
  forensic_signals: string[];
  is_beta: boolean;
  beta_message: string;
  feedback_prompt: string;
  disclaimer: string;
  error?: string;
};

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const steps = 60;
    const increment = target / steps;
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function LoadingOverlay({ wakingUp }: { wakingUp: boolean }) {
  const [frame, setFrame] = useState(0);
  const messages = ["Scanning content...", "Analyzing patterns...", "Running detection...", "Calculating results..."];
  useEffect(() => {
    const i = setInterval(() => setFrame(f => (f + 1) % messages.length), 900);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="absolute inset-0 bg-[#080B14]/95 backdrop-blur-sm rounded-2xl z-50 flex flex-col items-center justify-center gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-violet-500/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400/60 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }}></div>
        <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-violet-300/40 animate-spin" style={{ animationDuration: "2s" }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="text-center px-6">
        {wakingUp ? (
          <>
            <p className="font-semibold text-sm text-amber-400">Waking up the server...</p>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              The detection server was sleeping to save resources.<br/>
              This happens once and takes 30-60 seconds. Hang tight!
            </p>
            <div className="flex items-center justify-center gap-1 mt-3">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="font-semibold text-sm" style={{ background: "linear-gradient(135deg, #a78bfa, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TruthLens</p>
            <p className="text-gray-400 text-xs mt-1">{messages[frame]}</p>
          </>
        )}
      </div>
    </div>
  );
}

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl p-8 border border-violet-500/20 shadow-2xl shadow-violet-500/10 bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
              <span className="text-white text-sm font-bold">TL</span>
            </div>
            <div>
              <h2 className={`font-bold text-lg ${gradientText}`}>TruthLens</h2>
              <p className="text-xs text-gray-500">v0.1 Beta</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-all text-xl">✕</button>
        </div>
        <p className="text-sm leading-relaxed mb-4 text-gray-300">
          TruthLens is an AI-generated content detection platform built for the general public.
          It helps you verify whether text or images were created by AI tools like ChatGPT,
          Midjourney, or DALL-E — with sentence-level analysis and forensic image inspection.
        </p>
        <div className="rounded-xl p-4 mb-4 bg-gray-800 border border-violet-500/20">
          <p className="text-xs font-medium uppercase tracking-wider mb-2 text-gray-500">Built by</p>
          <p className="text-sm font-medium text-white">Aneesh Kumar Mourya</p>
        </div>
        <p className="text-xs text-gray-600">Results are probabilistic and should not be treated as definitive.</p>
        <button onClick={onClose} className="w-full mt-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>Close</button>
      </div>
    </div>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl p-8 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`font-bold text-lg ${gradientText}`}>Contact</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-all text-xl">✕</button>
        </div>
        <p className="text-sm mb-6 text-gray-400">Have feedback, a bug to report, or want to collaborate? Reach out!</p>
        <div className="flex flex-col gap-3">
          <a href="mailto:aneeshkrmourya@gmail.com"
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/50 text-gray-300 transition-all group">
          <span className="text-cyan-400 text-lg">✉</span>
        <div>
          <p className="text-sm font-medium group-hover:text-white transition-all">Email</p>
          <p className="text-xs text-gray-500">aneeshkrmourya@gmail.com</p>
         </div>
        </a>
        <a href="https://github.com/AneeshkrMoury/truthlens" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 hover:border-violet-500/50 text-gray-300 transition-all group">
          <span className="text-violet-400 text-lg">⌥</span>
          <div>
            <p className="text-sm font-medium group-hover:text-white transition-all">GitHub</p>
            <p className="text-xs text-gray-500">github.com/AneeshkrMoury/truthlens</p>
          </div>
        </a>
        <a href="https://aneeshkrmoury.github.io/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/50 text-gray-300 transition-all group">
          <span className="text-cyan-400 text-lg">🌐</span>
          <div>
            <p className="text-sm font-medium group-hover:text-white transition-all">Portfolio</p>
            <p className="text-xs text-gray-500">aneeshkrmoury.github.io</p>
          </div>
        </a>
        </div>
        <button onClick={onClose} className="w-full mt-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>Close</button>
      </div>
    </div>
  );
}

const faqs = [
  { q: "How accurate is TruthLens?", a: "Our text detection model achieves over 90% accuracy on benchmark datasets for modern LLMs including ChatGPT, Claude, and Gemini. Image detection is in beta and accuracy varies." },
  { q: "Does TruthLens store my content?", a: "No. Uploaded content is processed in memory and never stored on our servers. Your privacy is our priority." },
  { q: "Can TruthLens detect ChatGPT, Claude, and Gemini?", a: "Yes. Our text detection model is trained on output from all major LLMs including GPT-4, Claude, Gemini, and Llama." },
  { q: "Why is image detection in beta?", a: "Detecting AI-generated images reliably requires large training datasets of modern AI art. We are actively improving this feature and will upgrade it in a future release." },
  { q: "Is TruthLens free to use?", a: "Yes, TruthLens is free for general use. We plan to introduce a Pro tier for unlimited checks and API access in a future release." },
  { q: "What does the sentence highlighting mean?", a: "Each sentence is analyzed individually. Green means likely human-written, yellow means mixed signals, and red means likely AI-written. Hover over any sentence to see its exact AI probability score." },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [textResult, setTextResult] = useState<TextResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [wakingUp, setWakingUp] = useState(false);

  const wordCount = textInput.trim() === "" ? 0 : textInput.trim().split(/\s+/).length;
  const charCount = textInput.length;
  const showWordWarning = wordCount > 0 && wordCount < 50 && textInput.length > 10;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageResult(null);
      setError(null);
      setFeedback(null);
    }
  };

  const handleDetect = async () => {
    setLoading(true);
    setImageResult(null);
    setTextResult(null);
    setError(null);
    setFeedback(null);
    setWakingUp(false);

  // Track analysis event in GA4
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "analyze_content", {
        event_category: "Detection",
        event_label: activeTab === "text" ? "Text Detection" : "Image Detection",
        value: activeTab === "text" ? textInput.length : 1,
      });
    }

  // Set a timer — if no response in 5 seconds show waking up message
    const wakeTimer = setTimeout(() => {
      setWakingUp(true);
    }, 5000);

    try {
      if (activeTab === "image") {
        if (!imageFile) return;
          const formData = new FormData();
          formData.append("file", imageFile);
          const res = await fetch("https://aneeshkrmourya-truthlens-backend.hf.space/detect/image", { method: "POST", body: formData });
          const data = await res.json();
          setImageResult(data.result);
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "detection_result", {
            event_category: "Detection",
            event_label: "Image Result",
            value: data.result?.confidence || 0,
            });
          }
        } else {
        if (!textInput.trim()) return;
          const formData = new FormData();
          formData.append("text", textInput);
          const res = await fetch("https://aneeshkrmourya-truthlens-backend.hf.space/detect/text", { method: "POST", body: formData });
          const data = await res.json();
          setTextResult(data.result);
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "detection_result", {
            event_category: "Detection",
            event_label: "Text Result",
            value: data.result?.confidence || 0,
            });
          }
        }
      } catch {
        setError("Could not connect to the detection server. Please try again in a moment.");
      } finally {
        clearTimeout(wakeTimer);
        setWakingUp(false);
        setLoading(false);
      }
    };

  const getVerdictStyle = (color: string) => {
    if (color === "green") return "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
    if (color === "yellow") return "bg-amber-500/10 border border-amber-500/30 text-amber-400";
    if (color === "red") return "bg-rose-500/10 border border-rose-500/30 text-rose-400";
    if (color === "gray") return "bg-gray-500/10 border border-gray-500/30 text-gray-400";
    return "";
  };

  const getSentenceHighlight = (color: string) => {
    if (color === "green") return "bg-emerald-500/15 border-b-2 border-emerald-500/60";
    if (color === "yellow") return "bg-amber-500/15 border-b-2 border-amber-500/60";
    if (color === "red") return "bg-rose-500/15 border-b-2 border-rose-500/60";
    return "";
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-white">
      <style>{`
        .gradient-border {
          position: relative;
          background: linear-gradient(#0d1117, #0d1117) padding-box,
                      linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.4)) border-box;
          border: 1px solid transparent;
        }
        .gradient-border:hover {
          background: linear-gradient(#0d1117, #0d1117) padding-box,
                      linear-gradient(135deg, rgba(124,58,237,0.8), rgba(6,182,212,0.8)) border-box;
        }
        .glow-violet { box-shadow: 0 0 30px rgba(124,58,237,0.15); }
        .glow-cyan { box-shadow: 0 0 30px rgba(6,182,212,0.15); }
        .grid-bg {
          background-image: linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(6,182,212,0.4), transparent);
        }
        .stat-card {
          background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08));
          border: 1px solid rgba(124,58,237,0.2);
        }
        .analyze-btn {
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          transition: opacity 0.2s;
        }
        .analyze-btn:hover { opacity: 0.9; }
        .analyze-btn:disabled { background: #1f2937; color: #4b5563; }
      `}</style>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-30 border-b border-gray-800/80 backdrop-blur-xl bg-[#080B14]/80">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
              <span className="text-white text-xs font-bold">TL</span>
            </div>
            <span className={`font-bold text-lg ${gradientText}`}>TruthLens</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {[
              { id: "text", label: "Text Detection", badge: null },
              { id: "image", label: "Image Detection", badge: "Beta" },
              { id: "document", label: "Document Detection", badge: "Soon" },
            ].map(item => (
              <button key={item.id}
                onClick={() => {
                  if (item.badge === "Soon") return;
                  setActiveTab(item.id as "text" | "image");
                  setTextResult(null); setImageResult(null); setError(null);
                }}
                disabled={item.badge === "Soon"}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "text-white"
                    : item.badge === "Soon"
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                style={activeTab === item.id ? { background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))", border: "1px solid rgba(124,58,237,0.4)" } : {}}
              >
                {item.label}
                {item.badge && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    item.badge === "Beta" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-gray-800 text-gray-600"
                  }`}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setShowAbout(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all">About</button>
            <button onClick={() => setShowContact(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>Contact</button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-gray-800 text-white">
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 px-4 py-4 flex flex-col gap-2 bg-[#080B14]">
            {[
              { id: "text", label: "Text Detection", badge: null },
              { id: "image", label: "Image Detection", badge: "Beta" },
              { id: "document", label: "Document Detection", badge: "Soon" },
            ].map(item => (
              <button key={item.id}
                onClick={() => {
                  if (item.badge === "Soon") return;
                  setActiveTab(item.id as "text" | "image");
                  setTextResult(null); setImageResult(null); setError(null);
                  setMobileMenuOpen(false);
                }}
                disabled={item.badge === "Soon"}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${
                  activeTab === item.id ? "text-white" : item.badge === "Soon" ? "text-gray-600 cursor-not-allowed" : "text-gray-400"
                }`}
                style={activeTab === item.id ? { background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))" } : {}}>
                {item.label}
                {item.badge && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.badge === "Beta" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-gray-800 text-gray-600"}`}>{item.badge}</span>
                )}
              </button>
            ))}
            <div className="flex gap-2 mt-2">
              <button onClick={() => { setShowAbout(true); setMobileMenuOpen(false); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-700 text-gray-400">About</button>
              <button onClick={() => { setShowContact(true); setMobileMenuOpen(false); }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>Contact</button>
            </div>
          </div>
        )}
      </nav>

      {/* TOOL SECTION */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-24 pb-16 grid-bg">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}></div>
            <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">
              {activeTab === "text" ? "Text Analysis" : "Image Analysis"}
            </span>
          </div>
          <h1 className={`text-4xl font-bold ${gradientText}`}>
            {activeTab === "text" ? "Text Detection" : "Image Detection"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {activeTab === "text"
              ? "Detect AI-generated or AI-assisted text with sentence-level analysis"
              : "Analyze images for signs of AI generation or manipulation"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Input Card */}
          <div className="flex-1 rounded-2xl p-6 relative gradient-border glow-violet bg-[#0d1117]">
            {loading && <LoadingOverlay wakingUp={wakingUp} />}

            {activeTab === "text" && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-medium uppercase tracking-widest text-gray-500">Paste your text</label>
                {showWordWarning && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-400 text-xs flex items-start gap-2">
                    <span className="mt-0.5 text-base">⚠</span>
                    <div>
                      <p className="font-medium">Low word count ({wordCount} words)</p>
                      <p className="opacity-70 mt-0.5">For best accuracy we recommend at least 50 words.</p>
                    </div>
                  </div>
                )}
                <textarea
                  value={textInput}
                  onChange={(e) => { setTextInput(e.target.value); setTextResult(null); setError(null); }}
                  disabled={loading}
                  placeholder="Paste your text here. For best results use at least 50 words..."
                  className="w-full min-h-72 lg:min-h-96 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none transition-all bg-gray-900/50 border border-gray-700/50 focus:border-violet-500/50"
                />
                <div className="flex justify-between items-center text-xs">
                  <div className="flex gap-3">
                    <span className={wordCount > 0 && wordCount < 50 ? "text-amber-500" : "text-gray-600"}>{wordCount} words</span>
                    <span className="text-gray-600">{charCount} characters</span>
                  </div>
                  {wordCount >= 50 && <span className="text-emerald-500">✓ Good length</span>}
                </div>
                <button onClick={handleDetect} disabled={loading || textInput.length < 100} className="w-full py-3 rounded-xl font-semibold text-sm analyze-btn">
                  {loading ? "Analyzing..." : "Analyze Text"}
                </button>
              </div>
            )}

            {activeTab === "image" && (
              <div className="flex flex-col gap-3">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-400 text-xs">
                  Image detection is in beta. Results may not be accurate for all AI-generated images.
                </div>
                <label className={`border-2 border-dashed border-gray-700 hover:border-violet-500/50 rounded-xl p-8 text-center cursor-pointer transition-all ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={loading} />
                  {imagePreview
                    ? <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
                    : (
                      <div className="text-gray-500">
                        <p className="text-4xl mb-3">🖼️</p>
                        <p className="text-sm">Click to upload an image</p>
                        <p className="text-xs mt-1 opacity-60">JPG, PNG, WEBP up to 20MB</p>
                      </div>
                    )}
                </label>
                <button onClick={handleDetect} disabled={loading || !imageFile} className="w-full py-3 rounded-xl font-semibold text-sm analyze-btn">
                  {loading ? "Analyzing..." : "Analyze Image"}
                </button>
              </div>
            )}

            {error && <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">{error}</div>}
          </div>

          {/* Results Card */}
          <div className={`flex-1 rounded-2xl gradient-border glow-cyan bg-[#0d1117] ${!textResult && !imageResult ? "flex items-center justify-center min-h-64" : "p-6"}`}>
            {!textResult && !imageResult && (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))" }}>
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="text-sm font-medium text-gray-500">Results will appear here</p>
                <p className="text-xs mt-1 text-gray-600">Upload content and click Analyze</p>
              </div>
            )}

            {textResult && !textResult.error && (
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-xl text-center ${getVerdictStyle(textResult.verdict_color)}`}>
                  <p className="text-xl font-bold">{textResult.verdict}</p>
                  <p className="text-sm mt-1 opacity-75">Confidence: {textResult.confidence}%</p>
                </div>
                <div className="rounded-xl p-4 bg-gray-900/50 border border-gray-700/50">
                  <div className="flex justify-between text-xs mb-2 text-gray-600"><span>Human</span><span>AI</span></div>
                  <div className="w-full rounded-full h-2.5 bg-gray-800">
                    <div className="h-2.5 rounded-full transition-all duration-1000" style={{ width: `${textResult.confidence}%`, background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }} />
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-emerald-400">{(textResult.real_score * 100).toFixed(1)}% Human</span>
                    <span className="text-rose-400">{(textResult.ai_score * 100).toFixed(1)}% AI</span>
                  </div>
                </div>
                {textResult.sentences?.length > 0 && (
                  <div className="rounded-xl p-4 bg-gray-900/50 border border-gray-700/50">
                    <p className="text-xs font-medium uppercase tracking-widest mb-3 text-gray-500">Sentence Analysis</p>
                    <div className="text-sm leading-relaxed text-gray-300">
                      {textResult.sentences.map((s, i) => (
                        <span key={i} title={`${Math.round(s.ai_score * 100)}% AI likelihood`}
                          className={`inline cursor-help px-0.5 rounded-sm mx-0.5 ${getSentenceHighlight(s.color)}`}>
                          {s.sentence}{" "}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-4 pt-3 border-t border-gray-800">
                      {[["emerald", "Human"], ["amber", "Mixed"], ["rose", "AI"]].map(([c, label]) => (
                        <span key={c} className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className={`w-3 h-3 rounded-sm inline-block border-b-2 bg-${c}-500/30 border-${c}-500`}></span>
                          {label}
                        </span>
                      ))}
                      <span className="text-xs ml-auto text-gray-600">Hover for %</span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-center text-gray-700">{textResult.disclaimer}</p>
              </div>
            )}

            {imageResult && !imageResult.error && (
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-xl text-center ${getVerdictStyle(imageResult.verdict_color)}`}>
                  <p className="text-xl font-bold">{imageResult.verdict}</p>
                  {imageResult.verdict_color !== "gray" && <p className="text-sm mt-1 opacity-75">Confidence: {imageResult.confidence}%</p>}
                </div>
                <div className="rounded-xl p-4 bg-gray-900/50 border border-gray-700/50">
                  <p className="text-sm text-gray-300">{imageResult.explanation}</p>
                  {imageResult.confidence_note && <p className="text-xs mt-2 text-gray-600">{imageResult.confidence_note}</p>}
                </div>
                {imageResult.verdict_color !== "gray" && (
                  <div className="rounded-xl p-4 bg-gray-900/50 border border-gray-700/50">
                    <div className="flex justify-between text-xs mb-2 text-gray-600"><span>Real</span><span>AI Generated</span></div>
                    <div className="w-full rounded-full h-2.5 bg-gray-800">
                      <div className="h-2.5 rounded-full transition-all duration-1000" style={{ width: `${imageResult.confidence}%`, background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }} />
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-emerald-400">{(imageResult.real_score * 100).toFixed(1)}% Real</span>
                      <span className="text-rose-400">{(imageResult.ai_score * 100).toFixed(1)}% AI</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Detected type:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa" }}>{imageResult.image_type}</span>
                </div>
                {imageResult.forensic_signals?.length > 0 && (
                  <div className="rounded-xl p-4 bg-gray-900/50 border border-gray-700/50">
                    <p className="text-xs font-medium uppercase tracking-widest mb-2 text-gray-500">Forensic Signals</p>
                    {imageResult.forensic_signals.map((s, i) => (
                      <p key={i} className="text-xs flex items-start gap-2 mt-1 text-gray-400">
                        <span className="text-cyan-400 mt-0.5">›</span>{s}
                      </p>
                    ))}
                  </div>
                )}
                <div className="rounded-xl p-4 bg-gray-900/50 border border-gray-700/50">
                  <p className="text-xs mb-3 text-gray-500">{imageResult.feedback_prompt}</p>
                  <div className="flex gap-2">
                    {["correct", "incorrect"].map(f => (
                      <button key={f} onClick={() => setFeedback(f as "correct" | "incorrect")}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                          feedback === f
                            ? f === "correct" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-rose-500/20 border-rose-500/40 text-rose-400"
                            : "border-gray-700 text-gray-500 hover:border-gray-500"
                        }`}>
                        {f === "correct" ? "Yes, correct" : "No, incorrect"}
                      </button>
                    ))}
                  </div>
                  {feedback && <p className="text-xs mt-2 text-center text-gray-600">{feedback === "correct" ? "Thanks for confirming!" : "Thanks — helps us improve!"}</p>}
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-400 text-xs">{imageResult.beta_message}</div>
              </div>
            )}

            {(textResult?.error || imageResult?.error) && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
                {textResult?.error || imageResult?.error}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SECTION DIVIDER */}
      <div className="section-divider"></div>

      {/* WHAT IS TRUTHLENS */}
      <section className="py-24 bg-[#0a0d18]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}></div>
                <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">What is TruthLens</span>
              </div>
              <h2 className="text-5xl font-bold leading-tight mb-6 text-white">
                Detect AI content<br />
                <span className={gradientText}>before it misleads</span>
              </h2>
              <p className="text-base leading-relaxed mb-4 text-gray-400">
                TruthLens is a free AI-generated content detection platform built for everyone — not just researchers or developers. Whether you're a student, journalist, educator, or curious reader, TruthLens helps you verify whether text or images were created by an AI tool.
              </p>
              <p className="text-base leading-relaxed text-gray-500">
                Unlike other tools, TruthLens provides sentence-level analysis so you can see exactly which parts of a text are likely AI-written — not just a single score for the whole document.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { icon: "📝", title: "Text Detection", desc: "Detects ChatGPT, Claude, Gemini, Llama and more", color: "violet" },
                { icon: "🖼️", title: "Image Analysis", desc: "Forensic inspection with ELA and noise analysis", color: "cyan" },
                { icon: "🔍", title: "Sentence Level", desc: "See exactly which sentences are AI-written", color: "violet" },
                { icon: "🔒", title: "Privacy First", desc: "Your content is never stored on our servers", color: "cyan" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-5 transition-all gradient-border hover:glow-violet bg-[#0d1117]"
                  style={{ borderLeft: `3px solid ${item.color === "violet" ? "#7c3aed" : "#06b6d4"}` }}>
                  <p className="text-2xl mb-3">{item.icon}</p>
                  <p className="text-sm font-semibold mb-1 text-white">{item.title}</p>
                  <p className="text-xs leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* STATS */}
      <section className="py-24 bg-[#080B14]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}></div>
            <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">By the numbers</span>
            <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #06b6d4, #7c3aed)" }}></div>
          </div>
          <h2 className="text-4xl font-bold mb-4 text-white">Built for accuracy and <span className={gradientText}>transparency</span></h2>
          <p className="text-gray-500 mb-14 max-w-xl mx-auto">Every number here reflects a real design decision we made to build something trustworthy.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { target: 90, suffix: "%+", label: "Text detection accuracy", sub: "On modern LLMs", color: "violet" },
              { target: 4, suffix: "", label: "Detection signals", sub: "Per text analysis", color: "cyan" },
              { target: 3, suffix: "", label: "Forensic methods", sub: "For image analysis", color: "violet" },
              { target: 0, suffix: "", label: "Content stored", sub: "Your privacy guaranteed", color: "cyan" },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-8 stat-card transition-all hover:glow-violet">
                <p className={`text-5xl font-bold mb-3 ${gradientText}`}>
                  <AnimatedCounter target={item.target} suffix={item.suffix} />
                </p>
                <p className="text-sm font-semibold mb-1 text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-[#0a0d18]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}></div>
              <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">The technology</span>
              <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #06b6d4, #7c3aed)" }}></div>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">How <span className={gradientText}>TruthLens</span> works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">A combination of machine learning models and established forensic techniques working together.</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            {[
              {
                icon: "📝", title: "Text Detection", badge: null, accent: "#7c3aed",
                desc: "Our text detector uses a fine-tuned DeBERTa-v3 model trained on millions of human and AI-written samples.",
                items: [
                  { name: "Perplexity Analysis", desc: "AI text is highly predictable — low perplexity scores indicate machine generation" },
                  { name: "Burstiness Scoring", desc: "Humans write in bursts of short and long sentences. AI writes uniformly" },
                  { name: "Sentence Classification", desc: "Each sentence is scored individually so you can pinpoint AI-written sections" },
                  { name: "DeBERTa-v3 Model", desc: "State-of-the-art transformer trained on GPT-4, Claude, Gemini and Llama output" },
                ]
              },
              {
                icon: "🖼️", title: "Image Detection", badge: "Beta", accent: "#06b6d4",
                desc: "Three research-backed forensic techniques alongside a vision transformer model to detect signs of AI generation.",
                items: [
                  { name: "EXIF Metadata Forensics", desc: "Real photos contain camera metadata. AI images often lack it or show editing software traces" },
                  { name: "Error Level Analysis (ELA)", desc: "Based on Krawetz (2007) — detects recompressed or edited regions by comparing compression artifacts" },
                  { name: "Noise Pattern Analysis", desc: "Real cameras produce stochastic sensor noise. AI images have unnaturally smooth patterns" },
                  { name: "Image Type Detection", desc: "Identifies photos, illustrations, screenshots and documents — applying the right analysis for each" },
                ]
              }
            ].map((section, si) => (
              <div key={si} className="flex-1 rounded-2xl p-6 gradient-border bg-[#0d1117]" style={{ borderTop: `3px solid ${section.accent}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${section.accent}20` }}>
                    <span className="text-lg">{section.icon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-white">{section.title}</h3>
                    {section.badge && <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">{section.badge}</span>}
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-5 text-gray-400">{section.desc}</p>
                <div className="flex flex-col gap-3">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-900/50" style={{ borderLeft: `3px solid ${section.accent}40` }}>
                      <div>
                        <p className="text-xs font-semibold mb-0.5 text-white">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* WHO IS IT FOR */}
      <section className="py-24 bg-[#080B14]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}></div>
              <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">Who uses TruthLens</span>
              <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #06b6d4, #7c3aed)" }}></div>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Built for everyone who <span className={gradientText}>values truth</span></h2>
            <p className="text-gray-500 max-w-xl mx-auto">From students to journalists, TruthLens is designed for anyone who needs to verify content authenticity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "🎓", title: "Students & Educators", desc: "Verify whether submitted assignments were AI-written. Promote academic honesty without accusing students unfairly.", accent: "#7c3aed" },
              { icon: "📰", title: "Journalists & Fact-checkers", desc: "Quickly verify the authenticity of quotes, articles, and images before publishing or sharing breaking news.", accent: "#06b6d4" },
              { icon: "🏢", title: "Businesses", desc: "Screen job applications, verify vendor documents, and ensure the content you receive is genuinely human-created.", accent: "#7c3aed" },
              { icon: "🧑‍💻", title: "Developers & Researchers", desc: "Use our API to integrate AI detection into your own products, platforms, and research pipelines.", accent: "#06b6d4" },
              { icon: "✍️", title: "Content Creators", desc: "Prove your content is human-written and build trust with your audience in a world full of AI-generated material.", accent: "#7c3aed" },
              { icon: "👤", title: "General Public", desc: "Anyone who wants to know if what they're reading or seeing online was created by a human or an AI tool.", accent: "#06b6d4" },
              ].map((item, i) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div key={i}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-6 transition-all gradient-border hover:glow-violet bg-[#0d1117]"
      style={{ borderLeft: `3px solid ${item.accent}` }}>
      <p className="text-3xl mb-4">{item.icon}</p>
      <h3 className="font-semibold text-base mb-2 transition-all duration-300"
        style={{
          color: hovered ? "transparent" : "#e5e7eb",
          backgroundImage: hovered ? "linear-gradient(135deg, #a78bfa, #67e8f9)" : "none",
          WebkitBackgroundClip: hovered ? "text" : "unset",
          backgroundClip: hovered ? "text" : "unset",
        }}>
        {item.title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
    </div>
  );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* FAQ */}
      <section className="py-24 bg-[#0a0d18]">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }}></div>
              <span className="text-xs font-medium uppercase tracking-widest text-cyan-400">FAQ</span>
              <div className="h-px w-8" style={{ background: "linear-gradient(90deg, #06b6d4, #7c3aed)" }}></div>
            </div>
            <h2 className="text-4xl font-bold text-white">Frequently asked <span className={gradientText}>questions</span></h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden transition-all gradient-border bg-[#0d1117]">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <span className={`text-lg transition-transform duration-300 text-cyan-400 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm leading-relaxed text-gray-400 border-t border-gray-800">
                    <p className="pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* FOOTER */}
      <footer className="py-10 bg-[#080B14]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
              <span className="text-white text-xs font-bold">TL</span>
            </div>
            <span className={`font-bold ${gradientText}`}>TruthLens</span>
            <span className="text-xs text-gray-600">v0.1 Beta</span>
          </div>
          <p className="text-xs text-center text-gray-600">Results are probabilistic and should not be treated as definitive. Always apply human judgment.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowAbout(true)} className="text-xs text-gray-600 hover:text-cyan-400 transition-all">About</button>
            <button onClick={() => setShowContact(true)} className="text-xs text-gray-600 hover:text-cyan-400 transition-all">Contact</button>
            <a href="https://github.com/AneeshkrMoury/truthlens" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-cyan-400 transition-all">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}