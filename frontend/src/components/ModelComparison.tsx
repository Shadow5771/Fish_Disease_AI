import { motion } from "framer-motion";
import { InteractiveCard } from "./InteractiveCard";
import {
  formatMs,
  formatPercent,
  MODEL_ACCENT,
  MODEL_ACCENT_SOFT,
} from "../lib/models";
import { usePrefersReducedMotion } from "../hooks/useMedia";
import type {
  DetectionViewMode,
  ScreeningResponse,
} from "../types/screening";
import { MODEL_NAMES } from "../types/screening";

interface Props {
  result: ScreeningResponse;
  selected: DetectionViewMode;
  onSelect: (view: DetectionViewMode) => void;
}

export function ModelComparison({
  result,
  selected,
  onSelect,
}: Props) {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      id="models"
      className="scroll-mt-20"
    >
      {/* Section heading */}
      <div className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Model ensemble</p>

            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Model comparison
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-mist">
              Three independently evaluated detectors provide complementary
              screening evidence. Select a model to inspect its detections.
            </p>
          </div>

          <div className="hidden rounded-full border border-line bg-ink-900/40 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted sm:block">
            Live inference
          </div>
        </div>
      </div>

      {/* Model cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {MODEL_NAMES.map((name, index) => {
          const model = result.models[name];
          const accent = MODEL_ACCENT[name];
          const softAccent = MODEL_ACCENT_SOFT[name];
          const isSelected = selected === name;

          const confidence = model.confidence ?? 0;

          return (
            <motion.div
              key={name}
              initial={
                reduced
                  ? false
                  : {
                      opacity: 0,
                      y: 18,
                      scale: 0.985,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 24,
                delay: reduced ? 0 : index * 0.07,
              }}
              className="min-w-0"
            >
              <InteractiveCard
                selected={isSelected}
                onSelect={() => onSelect(name)}
                ariaLabel={`${name}, ${
                  model.class ?? "no detection"
                }`}
                className="h-full"
              >
                <div className="relative flex h-full min-h-[245px] flex-col p-5">
                  {/* Top model identifier */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="relative flex h-2.5 w-2.5 items-center justify-center rounded-full"
                        style={{
                          background: accent,
                          boxShadow: `0 0 14px ${accent}`,
                        }}
                        aria-hidden="true"
                      />

                      <p className="font-display text-xs font-bold tracking-[0.16em]">
                        {name}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                        isSelected
                          ? "border-accent/30 bg-accent/[0.08] text-accent"
                          : "border-line bg-white/[0.02] text-muted"
                      }`}
                    >
                      {isSelected ? "Selected" : "Inspect"}
                    </span>
                  </div>

                  {/* Main prediction */}
                  <div className="mt-7">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                      Screening output
                    </p>

                    <h3 className="mt-2 break-words font-display text-xl font-semibold leading-tight tracking-tight">
                      {model.class ?? "No detection"}
                    </h3>

                    <div className="mt-3 flex items-end gap-2">
                      <span
                        className="font-display text-3xl font-semibold tracking-tight"
                        style={{
                          color:
                            confidence > 0
                              ? accent
                              : undefined,
                        }}
                      >
                        {formatPercent(model.confidence)}
                      </span>

                      <span className="mb-1 text-xs text-muted">
                        confidence
                      </span>
                    </div>
                  </div>

                  {/* Confidence meter */}
                  <div className="mt-4">
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.max(
                            0,
                            Math.min(100, confidence * 100),
                          )}%`,
                        }}
                        transition={{
                          duration: reduced ? 0 : 0.7,
                          delay: reduced
                            ? 0
                            : index * 0.07 + 0.15,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{
                          background: accent,
                          boxShadow: `0 0 12px ${accent}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Runtime metrics */}
                  <dl className="mt-auto grid grid-cols-2 gap-2 pt-6">
                    <div
                      className="rounded-lg border border-white/[0.045] px-3 py-2.5"
                      style={{
                        background: softAccent,
                      }}
                    >
                      <dt className="text-[9px] font-medium uppercase tracking-[0.15em] text-muted">
                        Detections
                      </dt>

                      <dd className="mt-1.5 font-display text-sm font-semibold tabular-nums">
                        {model.num_detections}
                      </dd>
                    </div>

                    <div
                      className="rounded-lg border border-white/[0.045] px-3 py-2.5"
                      style={{
                        background: softAccent,
                      }}
                    >
                      <dt className="text-[9px] font-medium uppercase tracking-[0.15em] text-muted">
                        Inference
                      </dt>

                      <dd className="mt-1.5 font-display text-sm font-semibold tabular-nums">
                        {formatMs(model.inference_ms)}
                      </dd>
                    </div>
                  </dl>

                  {/* Selected indicator */}
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-x-5 bottom-0 h-px origin-left"
                    initial={false}
                    animate={{
                      scaleX: isSelected ? 1 : 0,
                      opacity: isSelected ? 1 : 0,
                    }}
                    transition={{
                      duration: reduced ? 0 : 0.25,
                    }}
                    style={{
                      background: accent,
                      boxShadow: `0 0 14px ${accent}`,
                    }}
                  />
                </div>
              </InteractiveCard>
            </motion.div>
          );
        })}
      </div>

      {/* Runtime interpretation */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-line bg-ink-900/25 px-4 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Runtime view
        </span>

        <span className="text-xs text-mist">
          Confidence reflects the selected image inference, not the
          model's benchmark accuracy.
        </span>
      </div>
    </section>
  );
}