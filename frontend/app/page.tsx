"use client";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDetect = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      if (activeTab === "image") {
        if (!imageFile) return;
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch("http://localhost:8000/detect/image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        setResult(data.result);
      } else {
        if (!textInput.trim()) return;
        const formData = new FormData();
        formData.append("text", textInput);
        const res = await fetch("http://localhost:8000/detect/text", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        setResult(data.result);
      }
    } catch (err) {
      setError("Could not connect to the detection server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyle = (color: string) => {
    if (color === "green") return "bg-green-500/10 border border-green-500/30 text-green-400";
    if (color === "yellow") return "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400";
    if (color === "red") return "bg-red-500/10 border border-red-500/30 text-red-400";
    return "";
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-indigo-400 tracking-tight">TruthLens</h1>
        <p className="text-gray-400 mt-3 text-lg">Detect AI-generated images and text instantly</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab("image"); setResult(null); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "image"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Image Detection
          </button>
          <button
            onClick={() => { setActiveTab("text"); setResult(null); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "text"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Text Detection
          </button>
        </div>

        {/* Image Tab */}
        {activeTab === "image" && (
          <div className="flex flex-col gap-4">
            <label className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition-all">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="text-gray-500">
                  <p className="text-4xl mb-3">🖼️</p>
                  <p className="text-sm">Click to upload an image</p>
                  <p className="text-xs mt-1 text-gray-600">JPG, PNG, WEBP up to 20MB</p>
                </div>
              )}
            </label>
          </div>
        )}

        {/* Text Tab */}
        {activeTab === "text" && (
          <div className="flex flex-col gap-4">
            <textarea
              value={textInput}
              onChange={(e) => { setTextInput(e.target.value); setResult(null); setError(null); }}
              placeholder="Paste your text here (minimum 100 characters)..."
              className="w-full h-48 bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
            <p className="text-xs text-gray-600 text-right">{textInput.length} characters</p>
          </div>
        )}

        {/* Detect Button */}
        <button
          onClick={handleDetect}
          disabled={loading || (activeTab === "image" ? !imageFile : textInput.length < 100)}
          className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-semibold text-sm transition-all"
        >
          {loading ? "Analyzing..." : "Analyze Content"}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {result && !result.error && (
          <div className="mt-6 flex flex-col gap-4">

            {/* Verdict */}
            <div className={`p-4 rounded-xl text-center ${getVerdictStyle(result.verdict_color)}`}>
              <p className="text-2xl font-bold">{result.verdict}</p>
              <p className="text-sm mt-1 opacity-75">Confidence: {result.confidence}%</p>
            </div>

            {/* Score Bar */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Human</span>
                <span>AI</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-indigo-500 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-green-400">{(result.real_score * 100).toFixed(1)}% Real</span>
                <span className="text-red-400">{(result.ai_score * 100).toFixed(1)}% AI</span>
              </div>
            </div>

            {/* Signals (text only) */}
            {result.signals && (
              <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Detection Signals</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Perplexity Score</span>
                  <span className="text-white font-medium">{result.signals.perplexity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Burstiness Score</span>
                  <span className="text-white font-medium">{result.signals.burstiness}</span>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-600 text-center">{result.disclaimer}</p>
          </div>
        )}

        {/* Result error */}
        {result?.error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {result.error}
          </div>
        )}

      </div>

      {/* Footer */}
      <p className="text-gray-700 text-xs mt-10">TruthLens v0.1 — Results are probabilistic, not definitive.</p>
    </main>
  );
}