import type { ImageQuality } from "../types/screening";

type Tone = "ok" | "warn" | "bad";

// Status strings come from the backend (image_quality.py); this only maps them to colours.
const OK = new Set(["GOOD", "ACCEPTABLE", "SHARP"]);
const WARN = new Set(["MODERATE", "MODERATE BLUR"]);
const toneOf = (status: string): Tone => (OK.has(status) ? "ok" : WARN.has(status) ? "warn" : "bad");

const OVERALL_TONE: Record<string, Tone> = {
  ACCEPTABLE: "ok",
  "ACCEPTABLE WITH WARNING": "warn",
  "LOW QUALITY": "bad",
};

const TEXT: Record<Tone, string> = {
  ok: "text-emerald-300",
  warn: "text-amber-300",
  bad: "text-rose-300",
};
const BAR: Record<Tone, string> = {
  ok: "bg-emerald-400/80",
  warn: "bg-amber-300/80",
  bad: "bg-rose-300/80",
};
const BADGE: Record<Tone, string> = {
  ok: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  warn: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  bad: "border-rose-300/30 bg-rose-300/10 text-rose-200",
};

// Visual scale for the meters only. The status text is decided by the backend.
const SCALE = { brightness: 255, contrast: 128, blur: 200 };
const ratio = (value: number, max: number) => Math.min(Math.max(value / max, 0), 1);

function Metric({
  label,
  value,
  status,
  fill,
}: {
  label: string;
  value: string;
  status: string;
  fill?: number;
}) {
  const tone = toneOf(status);
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-mist">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      {fill !== undefined && (
        <div aria-hidden="true" className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${BAR[tone]}`}
            style={{ width: `${Math.round(fill * 100)}%` }}
          />
        </div>
      )}
      <p className={`mt-1.5 text-xs ${TEXT[tone]}`}>{status}</p>
    </li>
  );
}

export function ImageQualityPanel({ quality }: { quality: ImageQuality }) {
  const overall = OVERALL_TONE[quality.status] ?? "warn";

  return (
    <section className="card animate-rise min-w-0 p-5 sm:p-7" aria-label="Image quality">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Image quality</p>
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium tracking-wide ${BADGE[overall]}`}
        >
          {quality.status}
        </span>
      </div>

      <ul className="mt-3 divide-y divide-line">
        <Metric
          label="Resolution"
          value={`${quality.width} × ${quality.height}`}
          status={quality.resolution_status}
        />
        <Metric
          label="Brightness"
          value={quality.brightness.toFixed(2)}
          status={quality.brightness_status}
          fill={ratio(quality.brightness, SCALE.brightness)}
        />
        <Metric
          label="Contrast"
          value={quality.contrast.toFixed(2)}
          status={quality.contrast_status}
          fill={ratio(quality.contrast, SCALE.contrast)}
        />
        <Metric
          label="Blur score"
          value={quality.blur_score.toFixed(2)}
          status={quality.blur_status}
          fill={ratio(quality.blur_score, SCALE.blur)}
        />
      </ul>

      {quality.warnings.length > 0 && (
        <div role="note" className="mt-4 rounded-lg border border-amber-300/25 bg-amber-300/5 p-3 text-sm">
          <ul className="list-disc pl-5 text-amber-100">
            {quality.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
          {quality.advisory && <p className="mt-2 text-mist">{quality.advisory}</p>}
        </div>
      )}
    </section>
  );
}