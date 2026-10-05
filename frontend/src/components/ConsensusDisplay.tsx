import { motion } from "framer-motion";
import { formatPercent } from "../lib/models";
import { usePrefersReducedMotion } from "../hooks/useMedia";
import type { ConsensusStatus, ScreeningResult } from "../types/screening";

interface Props {
  result: ScreeningResult;
}

const STATUS_STYLE: Record<ConsensusStatus, string> = {
  CONSENSUS:
    "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "PARTIAL CONSENSUS":
    "border-amber-300/30 bg-amber-300/10 text-amber-200",
  "NO CONSENSUS":
    "border-rose-300/30 bg-rose-300/10 text-rose-200",
  "NO DETECTION":
    "border-slate-400/30 bg-slate-400/10 text-slate-200",
};

const STATUS_DOT: Record<ConsensusStatus, string> = {
  CONSENSUS: "bg-emerald-300",
  "PARTIAL CONSENSUS": "bg-amber-300",
  "NO CONSENSUS": "bg-rose-300",
  "NO DETECTION": "bg-slate-300",
};

const STATUS_GLOW: Record<ConsensusStatus, string> = {
  CONSENSUS:
    "0 30px 80px -34px rgba(52, 211, 153, 0.38)",
  "PARTIAL CONSENSUS":
    "0 30px 80px -34px rgba(252, 211, 77, 0.22)",
  "NO CONSENSUS":
    "0 30px 80px -34px rgba(251, 113, 133, 0.20)",
  "NO DETECTION": "none",
};

function describe(
  result: ScreeningResult,
): { headline: string; sub: string | null } {
  switch (result.status) {
    case "CONSENSUS":
    case "PARTIAL CONSENSUS":
      return {
        headline: result.class ?? "",
        sub: null,
      };

    case "NO CONSENSUS":
      return {
        headline: "No consensus",
        sub: `The models did not agree on a class (${result.detected_models} of ${result.total_models} produced a detection).`,
      };

    default:
      return {
        headline: "No detection",
        sub: "No detection was produced by the evaluated models.",
      };
  }
}

function getStatusDescription(status: ConsensusStatus): string {
  switch (status) {
    case "CONSENSUS":
      return "All evaluated models agree on the screening class.";
    case "PARTIAL CONSENSUS":
      return "A subset of evaluated models agree on the screening class.";
    case "NO CONSENSUS":
      return "The evaluated models produced different screening classes.";
    default:
      return "The evaluated models did not produce a screening detection.";
  }
}

export function ConsensusDisplay({ result }: Props) {
  const reduced = usePrefersReducedMotion();

  const { headline, sub } = describe(result);

  const hasClass =
    result.status === "CONSENSUS" ||
    result.status === "PARTIAL CONSENSUS";

  const range =
    result.min_confidence !== null &&
    result.max_confidence !== null
      ? `${formatPercent(result.min_confidence)} – ${formatPercent(
          result.max_confidence,
        )}`
      : null;

  const agreementRatio =
    result.total_models > 0
      ? result.consensus_count / result.total_models
      : 0;

  return (
    <motion.section
      aria-label="Consensus result"
      className="card relative min-w-0 overflow-hidden p-5 sm:p-7 lg:p-8"
      initial={
        reduced
          ? false
          : {
              opacity: 0,
              y: 14,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 230,
        damping: 26,
      }}
      style={{
        boxShadow: STATUS_GLOW[result.status],
      }}
    >
      {/* Ambient result glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            result.status === "CONSENSUS"
              ? "rgba(52, 211, 153, 0.16)"
              : result.status === "PARTIAL CONSENSUS"
                ? "rgba(252, 211, 77, 0.12)"
                : result.status === "NO CONSENSUS"
                  ? "rgba(251, 113, 133, 0.10)"
                  : "rgba(148, 163, 184, 0.08)",
        }}
      />

      {/* Header */}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Screening result</p>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${STATUS_STYLE[result.status]}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[result.status]}`}
              />
              {result.status}
            </span>
          </div>
        </div>

        {/* Agreement count */}
        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
            Agreement
          </p>

          <div className="mt-1 font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
            {result.consensus_count}
            <span className="text-mist">
              /{result.total_models}
            </span>
          </div>
        </div>
      </div>

      {/* Primary result */}
      <div className="relative mt-7 border-t border-line pt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
          Ensemble screening output
        </p>

        <h2 className="mt-2 break-words font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.65rem]">
          {headline}
        </h2>

        {sub && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-mist">
            {sub}
          </p>
        )}

        {!sub && (
          <p className="mt-2 text-sm text-mist">
            {getStatusDescription(result.status)}
          </p>
        )}
      </div>

      {/* Agreement visualization */}
      <div className="relative mt-7">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Model agreement
          </span>

          <span className="text-xs tabular-nums text-mist">
            {result.agreement}
          </span>
        </div>

        <div className="flex h-2 gap-1.5">
          {Array.from(
            { length: result.total_models },
            (_, index) => {
              const active = index < result.consensus_count;

              return (
                <motion.span
                  key={index}
                  className="relative flex-1 overflow-hidden rounded-full bg-white/[0.06]"
                  initial={
                    reduced
                      ? false
                      : {
                          opacity: 0.3,
                          scaleX: 0.7,
                        }
                  }
                  animate={{
                    opacity: 1,
                    scaleX: 1,
                  }}
                  transition={{
                    duration: reduced ? 0 : 0.35,
                    delay: reduced ? 0 : index * 0.08,
                  }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: active ? 1 : 0,
                    }}
                    transition={{
                      duration: reduced ? 0 : 0.5,
                      delay: reduced ? 0 : 0.15 + index * 0.08,
                      ease: "easeOut",
                    }}
                    style={{
                      originX: 0,
                      background:
                        result.status === "CONSENSUS"
                          ? "rgb(110 231 183 / 0.85)"
                          : active
                            ? "rgb(92 200 232 / 0.75)"
                            : undefined,
                      boxShadow: active
                        ? "0 0 12px rgba(92, 200, 232, 0.20)"
                        : undefined,
                    }}
                  />
                </motion.span>
              );
            },
          )}
        </div>
      </div>

      {/* Metrics */}
      <dl className="relative mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-ink-900/55 p-4">
          <dt className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted">
            Agreement
          </dt>

          <dd className="mt-2 font-display text-2xl font-semibold tabular-nums">
            {hasClass
              ? `${result.consensus_count} / ${result.total_models}`
              : "None"}
          </dd>

          <p className="mt-1 text-[11px] text-muted">
            {Math.round(agreementRatio * 100)}% of models
          </p>
        </div>

        <div className="rounded-xl border border-line bg-ink-900/55 p-4">
          <dt className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted">
            Avg. confidence
          </dt>

          <dd className="mt-2 font-display text-2xl font-semibold tabular-nums">
            {formatPercent(result.average_confidence)}
          </dd>

          {range && (
            <p className="mt-1 text-[11px] tabular-nums text-muted">
              Range {range}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-ink-900/55 p-4">
          <dt className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted">
            Models detected
          </dt>

          <dd className="mt-2 font-display text-2xl font-semibold tabular-nums">
            {result.detected_models}
            <span className="text-mist">
              /{result.total_models}
            </span>
          </dd>

          <p className="mt-1 text-[11px] text-muted">
            Produced a detection
          </p>
        </div>
      </dl>

      {/* Decision note */}
      <div className="relative mt-5 rounded-xl border border-line bg-ink-900/35 px-4 py-3.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted">
          Decision note
        </p>

        <p className="mt-1.5 text-xs leading-5 text-mist">
          {result.decision_note}
        </p>
      </div>

      {/* Interpretation note */}
      <p className="relative mt-4 text-[11px] leading-5 text-muted">
        Average model confidence describes how strongly the models scored
        their own predictions. It is not a measure of disease certainty.
      </p>
    </motion.section>
  );
}