import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "../hooks/useMedia";

const stages = [
  {
    number: "01",
    label: "AUDIT",
    title: "Verify the dataset",
    description:
      "Inspect image integrity, class structure, duplicates and possible train-test leakage before interpreting model performance.",
  },
  {
    number: "02",
    label: "COMPARE",
    title: "Evaluate three models",
    description:
      "Run YOLO11n, YOLO11s and YOLO26n under a common experimental protocol.",
  },
  {
    number: "03",
    label: "STRESS-TEST",
    title: "Test image variation",
    description:
      "Measure performance changes when images are affected by blur, noise, brightness, contrast, compression and resolution changes.",
  },
  {
    number: "04",
    label: "EXPLAIN",
    title: "Inspect model behaviour",
    description:
      "Investigate visual regions associated with predictions using suitable explainability methods.",
  },
  {
    number: "05",
    label: "ANALYSE",
    title: "Study failures",
    description:
      "Examine false positives, false negatives and difficult disease-class confusion.",
  },
  {
    number: "06",
    label: "SCREEN",
    title: "Present the result",
    description:
      "Combine model outputs, confidence information and image-quality context into an AI-assisted preliminary screening result.",
  },
];

export function Methodology() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="methodology"
      className="scroll-mt-24 border-t border-line py-20 sm:py-24"
      aria-label="Research methodology"
    >
      <div className="mb-12 max-w-3xl">
        <p className="eyebrow">Research methodology</p>

        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-snow sm:text-4xl">
          From dataset audit to screening.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-mist sm:text-base">
          Each stage addresses a specific reliability question instead of
          treating model accuracy as the only measure of system quality.
        </p>
      </div>

      <div className="relative">
        {/* Connecting research line */}
        <div
          aria-hidden="true"
          className="absolute left-[19px] top-6 hidden h-[calc(100%-48px)] w-px bg-gradient-to-b from-accent/60 via-line to-transparent sm:block"
        />

        <div className="space-y-4">
          {stages.map((stage, index) => (
            <motion.article
              key={stage.number}
              initial={
                reducedMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -18,
                    }
              }
              whileInView={
                reducedMotion
                  ? undefined
                  : {
                      opacity: 1,
                      x: 0,
                    }
              }
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={
                reducedMotion
                  ? undefined
                  : {
                      duration: 0.45,
                      delay: index * 0.05,
                    }
              }
              className="group relative grid gap-5 sm:grid-cols-[40px_minmax(0,1fr)]"
            >
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ink-950 font-mono text-[10px] tracking-wider text-accent transition-all duration-300 group-hover:border-accent/50 group-hover:bg-accent/10">
                {stage.number}
              </div>

              <div className="card min-w-0 p-5 transition-transform duration-300 group-hover:-translate-y-0.5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-accent">
                      {stage.label}
                    </p>

                    <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-snow">
                      {stage.title}
                    </h3>
                  </div>

                  <span className="hidden text-xs text-muted sm:block">
                    Stage {stage.number}
                  </span>
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-mist">
                  {stage.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="eyebrow">Input</p>
          <p className="mt-3 font-display text-base font-semibold text-snow">
            Fish image
          </p>
          <p className="mt-2 text-sm leading-6 text-mist">
            Upload or camera capture with basic image-quality validation.
          </p>
        </div>

        <div className="card p-5">
          <p className="eyebrow">Analysis</p>
          <p className="mt-3 font-display text-base font-semibold text-snow">
            Model ensemble
          </p>
          <p className="mt-2 text-sm leading-6 text-mist">
            Three YOLO models independently analyse the same input.
          </p>
        </div>

        <div className="card p-5">
          <p className="eyebrow">Output</p>
          <p className="mt-3 font-display text-base font-semibold text-snow">
            Screening evidence
          </p>
          <p className="mt-2 text-sm leading-6 text-mist">
            Detection, confidence, agreement and analysis context are
            presented together.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-accent/15 bg-accent/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Evaluation principle</p>

            <p className="mt-2 font-display text-lg font-semibold text-snow">
              Audit → Compare → Stress-test → Explain → Analyse → Screen
            </p>
          </div>

          <span className="shrink-0 font-mono text-xs tracking-wider text-accent">
            RELIABILITY FOCUS
          </span>
        </div>
      </div>
    </section>
  );
}