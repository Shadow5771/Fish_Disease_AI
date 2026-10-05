import type {
  ConsensusStatus,
  ScreeningResponse,
  ViewError,
  ViewStatus,
} from "../types/screening";

interface Props {
  status: ViewStatus;
  result: ScreeningResponse | null;
  error: ViewError | null;
}

const pct = (value: number | null) => (value === null ? "—" : `${(value * 100).toFixed(1)}%`);

const STATUS_STYLE: Record<ConsensusStatus, string> = {
  CONSENSUS: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "PARTIAL CONSENSUS": "border-amber-300/30 bg-amber-300/10 text-amber-200",
  "NO CONSENSUS": "border-rose-300/30 bg-rose-300/10 text-rose-200",
  "NO DETECTION": "border-slate-400/30 bg-slate-400/10 text-slate-200",
};

function describe(result: ScreeningResponse["screening_result"]) {
  switch (result.status) {
    case "CONSENSUS":
    case "PARTIAL CONSENSUS":
      return {
        headline: (result.class ?? "").toUpperCase(),
        sub: `${result.consensus_count} / ${result.total_models} MODELS AGREE`,
      };
    case "NO CONSENSUS":
      return {
        headline: "NO CONSENSUS",
        sub: `Models did not agree on a class (${result.detected_models} of ${result.total_models} produced a detection).`,
      };
    default:
      return {
        headline: "NO DETECTION",
        sub: "No detection was produced by the evaluated models.",
      };
  }
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-ink-900/60 p-3">
      <dt className="text-xs text-mist">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
    </div>
  );
}

function ResultBody({ result }: { result: ScreeningResponse }) {
  const sr = result.screening_result;
  const quality = result.image_quality;
  const { headline, sub } = describe(sr);
  const hasClass = sr.status === "CONSENSUS" || sr.status === "PARTIAL CONSENSUS";
  const range =
    sr.min_confidence !== null && sr.max_confidence !== null
      ? `Range ${pct(sr.min_confidence)} – ${pct(sr.max_confidence)}`
      : undefined;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-mist">Screening result</p>
        <h2 className="mt-2 break-words text-3xl font-semibold tracking-tight sm:text-4xl">
          {headline}
        </h2>
        <p className="mt-2 text-sm text-mist">{sub}</p>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Model agreement"
          value={hasClass ? `${sr.consensus_count} / ${sr.total_models}` : "None"}
        />
        <Stat label="Average model confidence" value={pct(sr.average_confidence)} hint={range} />
        <div className="min-w-0 rounded-lg border border-line bg-ink-900/60 p-3">
          <dt className="text-xs text-mist">Status</dt>
          <dd className="mt-2">
            <span
              className={`inline-block rounded-md border px-2 py-1 text-xs font-medium tracking-wide ${STATUS_STYLE[sr.status]}`}
            >
              {sr.status}
            </span>
          </dd>
        </div>
      </dl>

      <p className="text-sm text-mist">{sr.decision_note}</p>

      <section>
        <h3 className="text-xs uppercase tracking-[0.16em] text-mist">Model predictions</h3>
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
          {Object.entries(result.models).map(([name, model]) => (
            <li key={name} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
              <span className="shrink-0 text-mist">{name}</span>
              <span className="min-w-0 truncate text-right">
                {model.class ?? "No detection"}
                {model.confidence !== null && (
                  <span className="ml-2 tabular-nums text-mist">{pct(model.confidence)}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-line p-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-mist">Image quality</span>
          <span className="text-right">{quality.status}</span>
        </div>
        {quality.warnings.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-amber-200">
            {quality.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
        {quality.advisory && <p className="mt-2 text-mist">{quality.advisory}</p>}
      </section>

      <p className="text-xs leading-relaxed text-mist">
        Average model confidence describes how strongly the models scored their own predictions. It
        is not a measure of disease certainty.
      </p>
    </div>
  );
}

export function ResultPanel({ status, result, error }: Props) {
  return (
    <section className="card min-w-0 p-5 sm:p-6" aria-live="polite" aria-label="Screening result">
      {status === "idle" && (
        <div className="flex min-h-[280px] flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.16em] text-mist">Screening result</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Ready for Screening</h2>
          <p className="mt-2 max-w-md text-sm text-mist">
            Add an image and select Analyse image. The same image is sent to all three models.
          </p>
        </div>
      )}

      {status === "loading" && (
        <div className="space-y-3" aria-busy="true">
          <p className="text-sm text-mist">Analysing with three models…</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-ink-800/70 motion-safe:animate-pulse" />
          ))}
        </div>
      )}

      {status === "error" && error && (
        <div className="flex min-h-[280px] flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.16em] text-rose-300">Screening could not be completed</p>
          <p className="mt-3 text-sm text-snow">{error.message}</p>
          <p className="mt-2 text-xs text-mist">Code: {error.code}</p>
        </div>
      )}

      {status === "done" && result && <ResultBody result={result} />}
    </section>
  );
}