import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="relative min-w-0">
      {/* Research status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-5 flex items-center gap-2"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>

        <p className="eyebrow">Research prototype</p>

        <span className="mx-1 h-3 w-px bg-line" />

        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
          Image analysis
        </span>
      </motion.div>

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="font-display text-4xl font-semibold leading-[1.03] tracking-[-0.035em] text-snow sm:text-5xl lg:text-6xl"
      >
        AI-ASSISTED
        <br />
        <span className="text-snow/95">FISH DISEASE</span>
        <br />
        <span className="text-accent">SCREENING</span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-6 max-w-lg text-sm leading-7 text-mist sm:text-base"
      >
        An image-based deep-learning framework that compares three detection
        models and combines their predictions for transparent, confidence-aware
        preliminary screening.
      </motion.p>

      {/* Research scope */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mt-7 max-w-lg rounded-xl border border-white/[0.06] bg-white/[0.018] p-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Evaluation focus
            </p>

            <p className="mt-1 text-xs leading-5 text-mist">
              Reliability beyond accuracy
            </p>
          </div>

          <div className="hidden h-8 w-px bg-line sm:block" />

          <div className="hidden items-center gap-4 sm:flex">
            <ScopeItem value="Robustness" />
            <ScopeItem value="Explainability" />
            <ScopeItem value="Error analysis" />
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.ul
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-8 grid max-w-lg grid-cols-3 border-y border-line"
      >
        <Metric value="3" label="Models" />
        <Metric value="5" label="Classes" bordered />
        <Metric value="AI" label="Screening" />
      </motion.ul>

      {/* Boundary */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mt-4 max-w-lg text-[10px] leading-5 text-muted"
      >
        Preliminary image-based screening only — not veterinary diagnosis or
        treatment advice.
      </motion.p>
    </div>
  );
}

function Metric({
  value,
  label,
  bordered = false,
}: {
  value: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <li
      className={`flex flex-col py-4 ${
        bordered ? "border-x border-line px-4" : ""
      }`}
    >
      <span className="font-display text-xl font-semibold tracking-tight text-snow">
        {value}
      </span>

      <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
    </li>
  );
}

function ScopeItem({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-mist/70">
      <span className="h-1 w-1 rounded-full bg-accent/70" />
      {value}
    </span>
  );
}