import { useRef, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];

function validate(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext) || (file.type && !ALLOWED_TYPES.includes(file.type))) {
    return "Unsupported file type. Please choose a JPG, JPEG or PNG image.";
  }
  if (file.size === 0) return "The selected file is empty.";
  if (file.size > MAX_BYTES) return "Image is larger than the 10 MB limit.";
  return null;
}

interface Props {
  file: File | null;
  previewUrl: string | null;
  loading: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
  onAnalyze: () => void;
}

const primaryButton =
  "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondaryButton =
  "rounded-lg border border-line px-4 py-2 text-sm text-snow transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function UploadPanel({ file, previewUrl, loading, onSelect, onClear, onAnalyze }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  function accept(candidate: File | undefined) {
    if (!candidate) return;
    const message = validate(candidate);
    setProblem(message);
    if (!message) onSelect(candidate);
  }

  function clear() {
    setProblem(null);
    onClear();
  }

  return (
    <section className="card min-w-0 p-5 sm:p-6" aria-label="Image input">
      <p className="text-xs uppercase tracking-[0.16em] text-mist">Image input</p>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />

      {previewUrl && file ? (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Selected fish image preview"
            className="max-h-[420px] w-full rounded-lg border border-line bg-ink-900 object-contain"
          />
          <p className="mt-3 truncate text-sm text-snow">{file.name}</p>
          <p className="text-xs text-mist">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={primaryButton} disabled={loading} onClick={onAnalyze}>
              {loading ? "Analysing…" : "Analyse image"}
            </button>
            <button
              type="button"
              className={secondaryButton}
              disabled={loading}
              onClick={() => inputRef.current?.click()}
            >
              Choose different image
            </button>
            <button type="button" className={secondaryButton} disabled={loading} onClick={clear}>
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
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
          className={`mt-4 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            dragging ? "border-accent bg-accent/5" : "border-line hover:border-accent/50 hover:bg-white/[0.02]"
          }`}
        >
          <p className="text-base text-snow">Drag and drop a fish image here</p>
          <p className="mt-1 text-sm text-mist">or select a file from your device</p>
          <p className="mt-4 text-xs text-mist">JPG, JPEG or PNG · up to 10 MB</p>
        </div>
      )}

      {problem && (
        <p role="alert" className="mt-3 text-sm text-rose-300">
          {problem}
        </p>
      )}
    </section>
  );
}