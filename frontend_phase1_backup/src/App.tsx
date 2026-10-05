import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import { OceanBackdrop } from "./components/OceanBackdrop";
import { Hero } from "./components/Hero";
import { UploadPanel } from "./components/UploadPanel";
import { ResultPanel } from "./components/ResultPanel";
import { ImageQualityPanel } from "./components/ImageQualityPanel";
import { ApiRequestError, screenImage } from "./services/api";
import type { ScreeningResponse, ViewError, ViewStatus } from "./types/screening";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ViewStatus>("idle");
  const [result, setResult] = useState<ScreeningResponse | null>(null);
  const [error, setError] = useState<ViewError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Release the object URL when the preview changes or the app unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function resetResult() {
    setResult(null);
    setError(null);
    setStatus("idle");
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

    try {
      const data = await screenImage(file, controller.signal);
      setResult(data);
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(
        err instanceof ApiRequestError
          ? { code: err.code, message: err.message }
          : { code: "UNKNOWN", message: "Something went wrong while analysing the image." },
      );
      setStatus("error");
    }
  }

  const uploadPanel = (
    <UploadPanel
      file={file}
      previewUrl={previewUrl}
      loading={status === "loading"}
      onSelect={handleSelect}
      onClear={handleClear}
      onAnalyze={handleAnalyze}
    />
  );

  return (
    <div className="relative min-h-screen">
      <OceanBackdrop />

      <div className="relative z-10">
        <Header />

        <main id="screening" className="mx-auto max-w-6xl px-4 sm:px-6">
          {!file ? (
            <section className="grid items-center gap-10 py-12 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
              <Hero />
              <div className="animate-rise min-w-0">{uploadPanel}</div>
            </section>
          ) : (
            <section className="animate-rise py-10">
              <div className="mb-7">
                <p className="eyebrow">Screening</p>
                <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  Image analysis
                </h1>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="min-w-0 space-y-6">
                  {uploadPanel}
                  {status === "done" && result && (
                    <ImageQualityPanel quality={result.image_quality} />
                  )}
                </div>
                <ResultPanel status={status} result={result} error={error} />
              </div>
            </section>
          )}
        </main>

        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs leading-relaxed text-mist sm:px-6">
          This system performs image-based AI screening and is not a substitute for veterinary
          diagnosis. The benchmark dataset used for evaluation is freshwater.
        </footer>
      </div>
    </div>
  );
}