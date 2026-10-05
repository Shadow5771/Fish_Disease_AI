import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/useMedia";
import type { ImageQuality } from "../types/screening";

type Tone = "ok" | "warn" | "bad";

// Status strings come from the backend. This component only controls presentation.
const OK = new Set(["GOOD", "ACCEPTABLE", "SHARP"]);
const WARN = new Set(["MODERATE", "MODERATE BLUR"]);

const toneOf = (status: string): Tone =>
  OK.has(status) ? "ok" : WARN.has(status) ? "warn" : "bad";

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

const DOT: Record<Tone, string> = {
  ok: "bg-emerald-300",
  warn: "bg-amber-300",
  bad: "bg-rose-300",
};

// Visual scale for meters only.
// The backend status remains the source of truth.
const SCALE = {
  brightness: 255,
  contrast: 128,
  blur: 200,
};

const ratio = (value: number, max: number) =>
  Math.min(Math.max(value / max, 0), 1);

function Metric({
  label,
  value,
  status,
  fill,
  index,
}: {
  label: string;
  value: string;
  status: string;
  fill?: number;
  index: number;
}) {
  const tone = toneOf(status);
  const reduced = usePrefersReducedMotion();

  return (
    <motion.li
      initial={
        reduced
          ? false
          : {
              opacity: 0,
              y: 6,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: reduced ? 0 : 0.25,
        delay: reduced ? 0 : index * 0.05,
      }}
      className="py-4 first:pt-3 last:pb-2"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[tone]}`}
            aria-hidden="true"
          />

          <span className="text-sm text-mist">{label}</span>
        </div>

        <span className="shrink-0 font-display text-sm font-semibold tabular-nums">
          {value}
        </span>
      </div>

      {fill !== undefined && (
        <div
          aria-hidden="true"
          className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]"
        >
          <motion.div
            className={`h-full rounded-full ${BAR[tone]}`}
            initial={{ width: 0 }}
            animate={{
              width: `${Math.round(fill * 100)}%`,
            }}
            transition={{
              duration: reduced ? 0 : 0.65,
              delay: reduced ? 0 : 0.1 + index * 0.05,
              ease: "easeOut",
            }}
            style={{
              boxShadow:
                tone === "ok"
                  ? "0 0 10px rgba(52,211,153,0.18)"
                  : tone === "warn"
                    ? "0 0 10px rgba(252,211,77,0.16)"
                    : "0 0 10px rgba(251,113,133,0.16)",
            }}
          />
        </div>
      )}

      <p className={`mt-2 text-[11px] ${TEXT[tone]}`}>
        {status}
      </p>
    </motion.li>
  );
}

export function ImageQualityPanel({
  quality,
}: {
  quality: ImageQuality;
}) {
  const reduced = usePrefersReducedMotion();

  const overall = OVERALL_TONE[quality.status] ?? "warn";

  

  return (
    <motion.section
      className="card min-w-0 overflow-hidden p-5 sm:p-7"
      aria-label="Image quality"
      initial={
        reduced
          ? false
          : {
              opacity: 0,
              y: 10,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 26,
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Pre-analysis check</p>

          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Image quality
          </h2>

          <p className="mt-1 text-xs leading-5 text-muted">
            Basic visual checks applied before model screening.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] ${BADGE[overall]}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${DOT[overall]}`}
            aria-hidden="true"
          />
          {quality.status}
        </span>
      </div>

      {/* Metrics */}
      <ul className="mt-5 divide-y divide-line">
        <Metric
          index={0}
          label="Resolution"
          value={`${quality.width} × ${quality.height}`}
          status={quality.resolution_status}
        />

        <Metric
          index={1}
          label="Brightness"
          value={quality.brightness.toFixed(2)}
          status={quality.brightness_status}
          fill={ratio(quality.brightness, SCALE.brightness)}
        />

        <Metric
          index={2}
          label="Contrast"
          value={quality.contrast.toFixed(2)}
          status={quality.contrast_status}
          fill={ratio(quality.contrast, SCALE.contrast)}
        />

        <Metric
          index={3}
          label="Blur score"
          value={quality.blur_score.toFixed(2)}
          status={quality.blur_status}
          fill={ratio(quality.blur_score, SCALE.blur)}
        />
      </ul>

      {/* Warning state */}
      {quality.warnings.length > 0 ? (
        <motion.div
          role="note"
          initial={
            reduced
              ? false
              : {
                  opacity: 0,
                  y: 6,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: reduced ? 0 : 0.25,
          }}
          className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.045] p-4"
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-[10px] font-bold text-amber-200"
              aria-hidden="true"
            >
              !
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200">
                Quality advisory
              </p>

              <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100/85">
                {quality.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>

              {quality.advisory && (
                <p className="mt-3 border-t border-amber-200/10 pt-3 text-xs leading-5 text-mist">
                  {quality.advisory}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.035] px-4 py-3">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-300"
            aria-hidden="true"
          />

          <p className="text-xs text-emerald-100/80">
            No image-quality warnings were reported.
          </p>
        </div>
      )}

      {/* Interpretation */}
      <p className="mt-4 text-[10px] leading-5 text-muted">
        These metrics describe image characteristics only. They do not
        indicate whether a fish is healthy or diseased.
      </p>
    </motion.section>
  );
}