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

function describe(result: ScreeningResponse["screening_result"]): {
  headline: string;
  sub: string | null;
} {
  switch (result.status) {
    case "CONSENSUS":
    case "PARTIAL CONSENSUS":
      return { headline: result.class ?? "", sub: null };
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

function ResultBody({ result }: { result: ScreeningResponse }) {
  const sr = result.screening_result;
  const { headline, sub } = describe(sr);
  const hasClass = sr.status === "CONSENSUS" || sr.status === "PARTIAL CONSENSUS";
  const range =
    sr.min_confidence !== null && sr.max_confidence !== null
      ? `Range ${pct(sr.min_confidence)} – ${pct(sr.max_confidence)}`
      : null;

  return (
    <div className="animate-rise space-y-7">
      <div>
        <p className="eyebrow">Screening result</p>
        <h2 className="mt-3 break-words font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {headline}
        </h2>
        {sub && <p className="mt-2 text-sm text-mist">{sub}</p>}
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-line bg-ink-900/60 p-4">
          <dt className="eyebrow">Model agreement</dt>
          <dd className="mt-3">
            <span className="font-display text-3xl font-semibold tabular-nums">
              {hasClass ? `${sr.consensus_count} / ${sr.total_models}` : "None"}
            </span>
            <span
              className={`mt-3 block w-fit rounded-md border px-2 py-1 text-xs font-medium tracking-wide ${STATUS_STYLE[sr.status]}`}
            >
              {sr.status}
            </span>
          </dd>
        </div>

        <div className="min-w-0 rounded-lg border border-line bg-ink-900/60 p-4">
          <dt className="eyebrow">Average model confidence</dt>
          <dd className="mt-3">
            <span className="font-display text-3xl font-semibold tabular-nums">
              {pct(sr.average_confidence)}
            </span>
            {range && <span className="mt-3 block text-xs text-mist">{range}</span>}
          </dd>
        </div>
      </dl>

      <p className="text-sm text-mist">{sr.decision_note}</p>

      <section>
        <h3 className="eyebrow">Model predictions</h3>
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

      <p className="text-xs leading-relaxed text-mist">
        Average model confidence describes how strongly the models scored their own predictions. It
        is not a measure of disease certainty.
      </p>
    </div>
  );
}

export function ResultPanel({ status, result, error }: Props) {
  return (
    <section className="card min-w-0 p-5 sm:p-7" aria-live="polite" aria-label="Screening result">
      {status === "idle" && (
        <div className="flex min-h-[250px] flex-col justify-center">
          <p className="eyebrow">Screening result</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
            Ready for Screening
          </h2>
          <p className="mt-2 max-w-md text-sm text-mist">
            Select Analyse image to send the image to all three models.
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
        <div className="flex min-h-[250px] flex-col justify-center">
          <p className="eyebrow text-rose-300">Screening could not be completed</p>
          <p className="mt-3 text-sm text-snow">{error.message}</p>
          <p className="mt-2 text-xs text-mist">Code: {error.code}</p>
        </div>
      )}

      {status === "done" && result && <ResultBody result={result} />}
    </section>
  );
}