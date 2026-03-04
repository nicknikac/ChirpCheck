"use client";

import { useCallback, useRef, useState } from "react";
import { analyzeAudio, type AnalysisResult } from "@/lib/api";

function WaveformVisual({ active }: { active: boolean }) {
  const bars = 24;
  return (
    <div
      className="flex items-end justify-center gap-[3px] h-48 md:h-64"
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => {
        const baseHeight = 20 + Math.sin(i * 0.7) * 15 + Math.cos(i * 1.3) * 10;
        return (
          <div
            key={i}
            className="w-[3px] rounded-full transition-all duration-300"
            style={{
              height: `${baseHeight}%`,
              animation: active
                ? `wave ${0.6 + (i % 5) * 0.15}s ease-in-out ${i * 0.05}s infinite`
                : "none",
              backgroundColor: active ? "#2d6a4f" : "#d6d0c4",
              opacity: active ? 0.7 + (i % 3) * 0.1 : 0.4,
            }}
          />
        );
      })}
    </div>
  );
}

function RecordButton({
  isRecording,
  disabled,
  onStart,
  onStop,
}: {
  isRecording: boolean;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {isRecording && (
        <span
          className="absolute inset-0 rounded-full bg-red-500/30"
          style={{ animation: "pulse-ring 1.5s ease-out infinite" }}
        />
      )}
      <button
        onClick={isRecording ? onStop : onStart}
        disabled={disabled}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={[
          "relative z-10 flex items-center gap-3 px-8 py-4",
          "text-base font-sans font-medium tracking-wide",
          "border-2 transition-all duration-200",
          "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-forest",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isRecording
            ? "bg-warm-900 text-cream border-warm-900 hover:bg-warm-800 active:bg-warm-700"
            : "bg-forest text-white border-forest hover:bg-forest-dark hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-none",
        ].join(" ")}
      >
        {isRecording ? (
          <>
            <span className="w-3.5 h-3.5 bg-red-400 rounded-sm animate-pulse" />
            Stop Recording
          </>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            Record Birdsong
          </>
        )}
      </button>
    </div>
  );
}

function ResultCard({ result }: { result: AnalysisResult }) {
  const pct = Math.round(result.confidence * 100);
  return (
    <section
      aria-live="polite"
      className="border-2 border-warm-800 bg-cream-50 p-6 md:p-8"
    >
      <p className="text-sm font-sans font-medium tracking-widest uppercase text-warm-500 mb-2">
        Identified Species
      </p>
      <h2 className="font-serif text-3xl md:text-4xl text-warm-900 mb-4">
        {result.species}
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-warm-200 overflow-hidden">
          <div
            className="h-full bg-forest transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-sans font-medium text-warm-600 tabular-nums">
          {pct}% confidence
        </span>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div
      role="status"
      aria-label="Analyzing audio"
      className="border-2 border-dashed border-warm-300 p-6 md:p-8 flex items-center gap-4"
    >
      <svg
        className="animate-spin h-5 w-5 text-forest shrink-0"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <div>
        <p className="font-sans font-medium text-warm-800">
          Analyzing your recording&hellip;
        </p>
        <p className="text-sm text-warm-500 mt-1">
          Running BirdNET identification model
        </p>
      </div>
    </div>
  );
}

function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="alert"
      className="border-2 border-red-700/30 bg-red-50 p-4 flex items-start gap-3"
    >
      <svg
        className="w-5 h-5 text-red-700 mt-0.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <p className="flex-1 text-sm font-sans text-red-800">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-700 hover:text-red-900 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-red-700"
        aria-label="Dismiss error"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </svg>
      </button>
    </div>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Record",
    description:
      "Hold your phone near a window or step outside. Tap record to capture 5–15 seconds of birdsong.",
  },
  {
    number: "02",
    title: "Analyze",
    description:
      "Your recording is sent to the BirdNET model, which compares it against 6,000+ bird species.",
  },
  {
    number: "03",
    title: "Identify",
    description:
      "Get the species name and a confidence score in seconds—no field guide required.",
  },
];

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        stream.getTracks().forEach((t) => t.stop());

        setIsAnalyzing(true);
        try {
          const analysisResult = await analyzeAudio(audioBlob);
          setResult(analysisResult);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Analysis failed. Please try again."
          );
        } finally {
          setIsAnalyzing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setError(
        "Microphone access denied. Please allow microphone permissions and try again."
      );
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return (
    <main id="main" className="min-h-screen">
      {/* ---- Header ---- */}
      <header className="px-6 md:px-12 lg:px-20 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="font-serif text-2xl text-warm-900 tracking-tight">
            ChirpCheck
          </p>
          <span className="text-xs font-sans font-medium tracking-widest uppercase text-warm-500">
            Bird ID by sound
          </span>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section className="px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-hero gap-12 md:gap-16 items-center">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-warm-900 leading-[1.1] mb-6">
              Name the bird
              <br />
              <span className="text-forest">by its song</span>
            </h1>
            <p className="font-sans text-lg text-warm-600 max-w-md mb-10 leading-relaxed">
              Point your microphone at birdsong and ChirpCheck identifies the
              species in seconds&mdash;powered by Cornell&rsquo;s BirdNET model
              trained on 6,000+ species.
            </p>
            <RecordButton
              isRecording={isRecording}
              disabled={isAnalyzing}
              onStart={startRecording}
              onStop={stopRecording}
            />
            {isRecording && (
              <p className="mt-4 text-sm text-warm-500 font-sans animate-pulse">
                Listening&hellip; tap &ldquo;Stop Recording&rdquo; when ready
              </p>
            )}
          </div>

          <div className="hidden md:block">
            <WaveformVisual active={isRecording} />
          </div>
        </div>
      </section>

      {/* ---- Results area ---- */}
      <section className="px-6 md:px-12 lg:px-20 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            {isAnalyzing && <LoadingState />}
            {error && (
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            )}
            {result && !isAnalyzing && <ResultCard result={result} />}
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t-2 border-warm-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-warm-900 mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="border-2 border-warm-200 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-forest"
              >
                <span className="text-sm font-sans font-bold text-forest tracking-widest">
                  {step.number}
                </span>
                <h3 className="font-serif text-2xl text-warm-900 mt-2 mb-3">
                  {step.title}
                </h3>
                <p className="font-sans text-warm-600 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="px-6 md:px-12 lg:px-20 py-8 border-t-2 border-warm-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-sans text-warm-500">
            Powered by{" "}
            <a
              href="https://birdnet.cornell.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest underline underline-offset-2 hover:text-forest-dark focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              BirdNET
            </a>{" "}
            from Cornell Lab of Ornithology
          </p>
          <p className="text-sm font-sans text-warm-400">
            ChirpCheck &middot; Open-source bird identification
          </p>
        </div>
      </footer>
    </main>
  );
}
