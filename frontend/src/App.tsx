import { useEffect, useRef, useState } from "react";
import { Methodology } from "./components/Methodology";
import { Header } from "./components/Header";
import { SectionReveal } from "./components/SectionReveal";
import { OceanBackdrop } from "./components/OceanBackdrop";
import { Hero } from "./components/Hero";
import { UploadPanel } from "./components/UploadPanel";
import { ResultPanel } from "./components/ResultPanel";
import { ImageQualityPanel } from "./components/ImageQualityPanel";
import { DetectionViewer } from "./components/DetectionViewer";
import { ModelComparison } from "./components/ModelComparison";
import { RequestTimer } from "./components/RequestTimer";
import { ResearchEvaluation } from "./components/ResearchEvaluation";
import { ApiRequestError, screenImage } from "./services/api";
import type {
  DetectionViewMode,
  ScreeningResponse,
  ViewError,
  ViewStatus,
} from "./types/screening";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ViewStatus>("idle");
  const [result, setResult] = useState<ScreeningResponse | null>(null);
  const [error, setError] = useState<ViewError | null>(null);
  const [view, setView] = useState<DetectionViewMode>("YOLO11n");
  const [requestMs, setRequestMs] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
  let frame = 0;

  const updateProgress = () => {
    frame = 0;

    const max =
      document.documentElement.scrollHeight - window.innerHeight;

    setScrollProgress(
      max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0,
    );
  };

  const handleScroll = () => {
    if (!frame) {
      frame = requestAnimationFrame(updateProgress);
    }
  };

  updateProgress();

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  window.addEventListener("resize", updateProgress);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", updateProgress);

    if (frame) {
      cancelAnimationFrame(frame);
    }
  };
}, []);

  function resetResult() {
    setResult(null);
    setError(null);
    setStatus("idle");
    setRequestMs(null);
    setView("YOLO11n");
  }

  function handleSelect(next: File) {
    abortRef.current?.abort();

    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));

    resetResult();
  }

  function handleClear() {
    abortRef.current?.abort();

    setFile(null);
    setPreviewUrl(null);

    resetResult();
  }

  async function handleAnalyze() {
    if (!file) return;

    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setResult(null);
    setError(null);
    setRequestMs(null);

    const started = performance.now();

    try {
      const data = await screenImage(file, controller.signal);

      setRequestMs(performance.now() - started);
      setResult(data);
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      setRequestMs(performance.now() - started);

      setError(
        err instanceof ApiRequestError
          ? {
              code: err.code,
              message: err.message,
            }
          : {
              code: "UNKNOWN",
              message:
                "Something went wrong while analysing the image.",
            },
      );

      setStatus("error");
    }
  }

  const uploadPanel = (
    <UploadPanel
      file={file}
      previewUrl={previewUrl}
      loading={status === "loading"}
      hidePreview={Boolean(file)}
      onSelect={handleSelect}
      onClear={handleClear}
      onAnalyze={handleAnalyze}
    />
  );

  return (
    <div id="top" className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-px origin-left bg-accent"
        style={{
          transform: `scaleX(${scrollProgress})`,
        }}
      />
      <OceanBackdrop />

      <div className="relative z-10">
        <Header />

        <main className="mx-auto max-w-6xl px-4 sm:px-6">
          {!file ? (
            <section
              id="screening"
              className="scroll-mt-20 grid items-center gap-10 py-12 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16"
            >
              <Hero />

              <div className="min-w-0">
                {uploadPanel}
              </div>
            </section>
          ) : (
            <section
              id="screening"
              className="scroll-mt-24"
            >
              <div>
                <p className="eyebrow">Screening workspace</p>

                <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Image analysis
                </h1>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
                {previewUrl && file && (
                  <DetectionViewer
                    previewUrl={previewUrl}
                    filename={file.name}
                    result={result}
                    view={view}
                    onViewChange={setView}
                  />
                )}

                <div className="min-w-0 space-y-4">
                  {uploadPanel}

                  {requestMs !== null && (
                    <div className="card p-5">
                      <RequestTimer durationMs={requestMs} />
                    </div>
                  )}

                  {status !== "done" && (
                    <ResultPanel
                      status={status}
                      result={result}
                      error={error}
                    />
                  )}
                </div>
              </div>

              {status === "done" && result && (
                <ResultPanel
                  status={status}
                  result={result}
                  error={error}
                />
              )}
            </section>
          )}

          {status === "done" && result && (
            <div className="space-y-8 pb-4 pt-4">
              
              <SectionReveal>
                <section id="models" className="scroll-mt-24">
                  <ModelComparison
                    result={result}
                    selected={view}
                    onSelect={setView}
                  />
                </section>
              </SectionReveal>
              

              <ImageQualityPanel
                quality={result.image_quality}
              />
            </div>
          )}

          <SectionReveal>
            <ResearchEvaluation id="research" />
          </SectionReveal>

          <SectionReveal delay={0.05}>
            <Methodology />
          </SectionReveal>
        </main>

        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs leading-relaxed text-mist sm:px-6">
          This system performs image-based AI screening and is not a
          substitute for veterinary diagnosis. The benchmark dataset used
          for evaluation is freshwater.
        </footer>
      </div>
    </div>
  );
}