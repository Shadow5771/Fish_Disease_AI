import { useEffect, useRef, useState } from "react";
import { Header } from "./components/Header";
import { UploadPanel } from "./components/UploadPanel";
import { ResultPanel } from "./components/ResultPanel";
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Image-based fish disease screening
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            The same image is analysed by three YOLO models with equal voting weight. Model
            agreement is reported separately from model confidence.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <UploadPanel
            file={file}
            previewUrl={previewUrl}
            loading={status === "loading"}
            onSelect={handleSelect}
            onClear={handleClear}
            onAnalyze={handleAnalyze}
          />
          <ResultPanel status={status} result={result} error={error} />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs leading-relaxed text-mist sm:px-6">
        This system performs image-based AI screening and is not a substitute for veterinary
        diagnosis. The benchmark dataset used for evaluation is freshwater.
      </footer>
    </div>
  );
}