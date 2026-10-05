import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/useMedia";
import { InteractiveCard } from "./InteractiveCard";

const benchmark = [
  {
    model: "YOLO11n",
    precision: 0.875,
    recall: 0.816,
    map50: 0.86,
    map5095: 0.675,
    params: "2.58M",
    gflops: "6.4",
    latency: "9.9 ms",
  },
  {
    model: "YOLO11s",
    precision: 0.907,
    recall: 0.836,
    map50: 0.881,
    map5095: 0.686,
    params: "9.41M",
    gflops: "21.4",
    latency: "13.0 ms",
  },
  {
    model: "YOLO26n",
    precision: 0.914,
    recall: 0.858,
    map50: 0.894,
    map5095: 0.7,
    params: "2.38M",
    gflops: "5.3",
    latency: "13.3 ms",
  },
];

const robustness = [
  { condition: "Original", yolo11n: 0.675, yolo11s: 0.686, yolo26n: 0.7 },
  { condition: "Blur", yolo11n: 0.472, yolo11s: 0.399, yolo26n: 0.558 },
  { condition: "Noise", yolo11n: 0.355, yolo11s: 0.209, yolo26n: 0.456 },
  {
    condition: "Brightness",
    yolo11n: 0.666,
    yolo11s: 0.677,
    yolo26n: 0.692,
  },
  {
    condition: "Contrast",
    yolo11n: 0.655,
    yolo11s: 0.673,
    yolo26n: 0.691,
  },
  {
    condition: "Compression",
    yolo11n: 0.673,
    yolo11s: 0.669,
    yolo26n: 0.694,
  },
  {
    condition: "Low resolution",
    yolo11n: 0.612,
    yolo11s: 0.627,
    yolo26n: 0.655,
  },
];

const researchCards = [
  {
    number: "01",
    title: "Dataset integrity",
    text: "Audit duplicate images and train-test leakage before interpreting final model performance.",
  },
  {
    number: "02",
    title: "Controlled comparison",
    text: "Evaluate YOLO11n, YOLO11s and YOLO26n using the same dataset and evaluation protocol.",
  },
  {
    number: "03",
    title: "Robustness",
    text: "Measure performance changes under controlled blur, noise, brightness, contrast, compression and resolution changes.",
  },
  {
    number: "04",
    title: "Explainability",
    text: "Inspect whether model attention is concentrated on visually relevant disease-related regions.",
  },
  {
    number: "05",
    title: "Error behaviour",
    text: "Study false positives, false negatives and difficult disease-class confusion.",
  },
  {
    number: "06",
    title: "Efficiency",
    text: "Compare model performance with parameter count, computational cost and inference latency.",
  },
];

interface Props {
  id?: string;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function ResearchEvaluation({ id = "research" }: Props) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-line py-20 sm:py-24"
      aria-label="Research evaluation"
    >
      <div className="mb-12 max-w-3xl">
        <p className="eyebrow">Research evaluation</p>

        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-snow sm:text-4xl">
          Reliability beyond accuracy.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-mist sm:text-base">
          The system evaluates model behaviour across data quality, controlled
          image degradation, explainability, errors and computational
          efficiency.
        </p>
      </div>

      {/* Research capability cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {researchCards.map((card, index) => (
          <motion.div
            key={card.number}
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={
              reducedMotion
                ? undefined
                : {
                    opacity: 1,
                    y: 0,
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
                    delay: index * 0.04,
                  }
            }
          >
            <InteractiveCard
              className="h-full"
              ariaLabel={`${card.title} research evaluation`}
            >
              <article className="group min-h-[190px] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-xs tracking-[0.2em] text-accent">
                    {card.number}
                  </span>

                  <span className="h-1.5 w-1.5 rounded-full bg-accent/70 transition-transform duration-300 group-hover:scale-150" />
                </div>

                <h3 className="mt-8 font-display text-lg font-semibold text-snow">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-mist">
                  {card.text}
                </p>

                <div className="mt-6 h-px w-8 bg-accent/30 transition-all duration-300 group-hover:w-14 group-hover:bg-accent/60" />
              </article>
            </InteractiveCard>
          </motion.div>
        ))}
      </div>

      {/* Controlled benchmark */}
      <div className="mt-16">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Controlled benchmark</p>

            <h3 className="mt-2 font-display text-2xl font-semibold text-snow">
              Model comparison
            </h3>
          </div>

          <p className="max-w-md text-right text-xs leading-5 text-muted">
            Validation results from the current experimental benchmark. These
            are benchmark metrics, not individual prediction confidence.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line bg-ink-950/50">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-4 font-medium">Model</th>
                <th className="px-4 py-4 font-medium">Precision</th>
                <th className="px-4 py-4 font-medium">Recall</th>
                <th className="px-4 py-4 font-medium">mAP50</th>
                <th className="px-4 py-4 font-medium">mAP50-95</th>
                <th className="px-4 py-4 font-medium">Params</th>
                <th className="px-4 py-4 font-medium">GFLOPs</th>
                <th className="px-4 py-4 font-medium">Latency</th>
              </tr>
            </thead>

            <tbody>
              {benchmark.map((row) => (
                <tr
                  key={row.model}
                  className="border-b border-line/70 last:border-b-0"
                >
                  <td className="px-5 py-4 font-display font-semibold text-snow">
                    {row.model}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-mist">
                    {formatPercent(row.precision)}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-mist">
                    {formatPercent(row.recall)}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-mist">
                    {formatPercent(row.map50)}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-accent">
                    {formatPercent(row.map5095)}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-mist">
                    {row.params}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-mist">
                    {row.gflops}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-mist">
                    {row.latency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Robustness */}
      <div id="robustness" className="scroll-mt-24 mt-16">
        <div className="mb-5">
          <p className="eyebrow">Robustness evaluation</p>

          <h3 className="mt-2 font-display text-2xl font-semibold text-snow">
            Controlled image degradation
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
            mAP50-95 under controlled synthetic image conditions. These
            transformations are experimental proxies and do not represent
            every real-world aquaculture environment.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line bg-ink-950/50">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-[0.12em] text-muted">
                <th className="px-5 py-4 font-medium">Condition</th>
                <th className="px-4 py-4 font-medium">YOLO11n</th>
                <th className="px-4 py-4 font-medium">YOLO11s</th>
                <th className="px-4 py-4 font-medium">YOLO26n</th>
              </tr>
            </thead>

            <tbody>
              {robustness.map((row) => (
                <tr
                  key={row.condition}
                  className="border-b border-line/70 last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium text-snow">
                    {row.condition}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-mist">
                    {formatPercent(row.yolo11n)}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-mist">
                    {formatPercent(row.yolo11s)}
                  </td>

                  <td className="px-4 py-4 tabular-nums text-accent">
                    {formatPercent(row.yolo26n)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="card p-5 sm:p-6">
            <p className="eyebrow">Observed behaviour</p>

            <p className="mt-3 text-sm leading-7 text-snow">
              Across the evaluated conditions, synthetic noise and blur caused
              substantially larger performance degradation than the tested
              brightness, contrast, compression and low-resolution conditions.
            </p>
          </div>

          <div className="card p-5 sm:p-6">
            <p className="eyebrow">Scope</p>

            <p className="mt-3 text-sm leading-7 text-mist">
              Results describe this benchmark and these controlled
              transformations only.
            </p>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-16 grid gap-4 lg:grid-cols-2">
        <InteractiveCard ariaLabel="Research interpretation: EUS class analysis">
          <div className="p-6 sm:p-7">
            <p className="eyebrow">Research interpretation</p>

            <h3 className="mt-3 font-display text-xl font-semibold text-snow">
              EUS remains a difficult class.
            </h3>

            <p className="mt-3 text-sm leading-7 text-mist">
              Class-wise validation results show substantially lower recall and
              mAP for EUS compared with several other classes. This indicates
              an important area for further dataset and error analysis.
            </p>
          </div>
        </InteractiveCard>

        <InteractiveCard ariaLabel="Validation boundary and leakage-aware evaluation">
          <div className="p-6 sm:p-7">
            <p className="eyebrow">Validation boundary</p>

            <h3 className="mt-3 font-display text-xl font-semibold text-snow">
              Results require leakage-aware interpretation.
            </h3>

            <p className="mt-3 text-sm leading-7 text-mist">
              Dataset integrity and train-test leakage must be resolved and
              re-evaluated before treating these benchmark values as final
              evidence of generalisation.
            </p>
          </div>
        </InteractiveCard>
      </div>
    </section>
  );
}