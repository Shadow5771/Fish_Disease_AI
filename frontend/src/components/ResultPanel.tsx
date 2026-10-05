import { motion } from "framer-motion";
import { ConsensusDisplay } from "./ConsensusDisplay";
import type {
  ScreeningResponse,
  ViewError,
  ViewStatus,
} from "../types/screening";

interface Props {
  status: ViewStatus;
  result: ScreeningResponse | null;
  error: ViewError | null;
}

export function ResultPanel({ status, result, error }: Props) {
  return (
    <section
      className="min-w-0"
      aria-live="polite"
      aria-label="Screening result"
    >
      {/* IDLE */}
      {status === "idle" && (
        <div className="card relative flex min-h-[220px] flex-col justify-center overflow-hidden p-5 sm:p-7">
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-accent/[0.035] blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
              <p className="eyebrow">Screening result</p>
            </div>

            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-snow">
              Ready for Screening
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-mist">
              Select{" "}
              <span className="font-medium text-snow/80">
                Analyse image
              </span>{" "}
              to send the image through all three detection models.
            </p>

            <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted">
              <span className="h-px w-6 bg-accent/40" />
              YOLO11n
              <span className="text-muted/40">·</span>
              YOLO11s
              <span className="text-muted/40">·</span>
              YOLO26n
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {status === "loading" && (
        <div
          className="card relative overflow-hidden p-5 sm:p-7"
          aria-busy="true"
        >
          <div className="absolute inset-x-0 top-0 h-px overflow-hidden bg-line">
            <motion.div
              className="h-full w-1/3 bg-accent/70"
              animate={{ x: ["-100%", "400%"] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Screening analysis</p>
              <p className="mt-2 text-sm font-medium text-snow">
                Analysing with three models
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="text-[9px] uppercase tracking-[0.15em] text-muted">
                Processing
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {["YOLO11n", "YOLO11s", "YOLO26n"].map((model, index) => (
              <motion.div
                key={model}
                initial={{ opacity: 0.45 }}
                animate={{ opacity: [0.45, 0.8, 0.45] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: index * 0.15,
                }}
                className="flex h-12 items-center justify-between rounded-lg border border-white/[0.05] bg-ink-800/50 px-4"
              >
                <span className="text-xs font-medium text-mist">
                  {model}
                </span>

                <span className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.span
                    className="block h-full w-1/2 rounded-full bg-accent/50"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 1.3,
                      repeat: Infinity,
                      delay: index * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                </span>
              </motion.div>
            ))}
          </div>

          <p className="mt-4 text-[10px] leading-5 text-muted">
            Running image inference and preparing the ensemble screening
            result.
          </p>
        </div>
      )}

      {/* ERROR */}
      {status === "error" && error && (
        <div className="card relative flex min-h-[220px] flex-col justify-center overflow-hidden p-5 sm:p-7">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-rose-400/[0.035] blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
              <p className="eyebrow text-rose-300">
                Screening could not be completed
              </p>
            </div>

            <p className="mt-4 max-w-lg text-sm leading-6 text-snow">
              {error.message}
            </p>

            <div className="mt-5 inline-flex items-center rounded-md border border-white/[0.06] bg-white/[0.025] px-3 py-2">
              <span className="mr-2 text-[9px] uppercase tracking-[0.14em] text-muted">
                Error code
              </span>

              <code className="text-xs text-rose-200/80">{error.code}</code>
            </div>

            <p className="mt-4 text-[10px] leading-5 text-muted">
              Check the image and screening service, then try the analysis
              again.
            </p>
          </div>
        </div>
      )}

      {/* RESULT */}
      {status === "done" && result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <ConsensusDisplay result={result.screening_result} />
        </motion.div>
      )}
    </section>
  );
}