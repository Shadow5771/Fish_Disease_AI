import { useRef, useState } from "react";
import { CameraCapture } from "./CameraCapture";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];

function validate(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (
    !ALLOWED_EXTENSIONS.includes(ext) ||
    (file.type && !ALLOWED_TYPES.includes(file.type))
  ) {
    return "Unsupported file type. Please choose a JPG, JPEG or PNG image.";
  }

  if (file.size === 0) {
    return "The selected file is empty.";
  }

  if (file.size > MAX_BYTES) {
    return "Image is larger than the 10 MB limit.";
  }

  return null;
}

interface Props {
  file: File | null;
  previewUrl: string | null;
  loading: boolean;
  hidePreview?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
  onAnalyze: () => void;
}

export function UploadPanel({
  file,
  previewUrl,
  loading,
  hidePreview = false,
  onSelect,
  onClear,
  onAnalyze,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const openPicker = () => {
    inputRef.current?.click();
  };

  function accept(candidate: File | undefined) {
    if (!candidate) return;

    const message = validate(candidate);

    setProblem(message);

    if (!message) {
      onSelect(candidate);
    }
  }

  function clear() {
    setProblem(null);
    onClear();
  }

  function handleCameraCapture(capturedFile: File) {
    const message = validate(capturedFile);

    if (message) {
      setProblem(message);
      return;
    }

    setProblem(null);
    setCameraOpen(false);
    onSelect(capturedFile);
  }

  return (
    <section
      className="card min-w-0 p-5 sm:p-7"
      aria-label="Image input"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {previewUrl && file ? (
        <div>
          <p className="eyebrow">Screening workspace</p>

          {!hidePreview && (
            <div className="mt-4 overflow-hidden rounded-lg border border-line bg-ink-900">
              <img
                src={previewUrl}
                alt={`Selected fish image: ${file.name}`}
                className="max-h-[440px] w-full object-contain"
              />
            </div>
          )}

          <div
            className={`${
              hidePreview ? "mt-4" : "mt-3"
            } flex items-baseline justify-between gap-3 text-sm`}
          >
            <span className="min-w-0 truncate text-snow">
              {file.name}
            </span>

            <span className="shrink-0 text-xs tabular-nums text-mist">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={onAnalyze}
            >
              {loading ? "Analysing…" : "Analyse image"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading}
              onClick={openPicker}
            >
              Choose different image
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading}
              onClick={clear}
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="font-display text-base font-semibold tracking-[0.14em]">
            START SCREENING
          </h2>

          <div
            role="button"
            tabIndex={0}
            aria-label="Add a fish image: drag and drop, or press Enter to browse files"
            onClick={openPicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openPicker();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              accept(e.dataTransfer.files[0]);
            }}
            className={`mt-5 flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              dragging
                ? "border-accent bg-accent/5"
                : "border-line hover:border-accent/50 hover:bg-white/[0.02]"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-8 w-8 text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 16V4m0 0-4 4m4-4 4 4" />
              <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
            </svg>

            <p className="mt-4 text-base text-snow">
              Drag and drop a fish image here
            </p>

            <p className="mt-1 text-sm text-mist">
              or choose a file from your device
            </p>

            <p className="mt-4 text-xs tracking-wide text-mist">
              JPG · JPEG · PNG · up to 10 MB
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={openPicker}
            >
              Upload Image
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCameraOpen(true)}
            >
              Use Camera
            </button>
          </div>
        </div>
      )}

      {problem && (
        <p role="alert" className="mt-4 text-sm text-rose-300">
          {problem}
        </p>
      )}

      {cameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </section>
  );
}