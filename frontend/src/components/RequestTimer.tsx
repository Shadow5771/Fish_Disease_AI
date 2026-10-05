import { formatMs } from "../lib/models";

interface Props {
  durationMs: number | null;
}

export function RequestTimer({ durationMs }: Props) {
  if (durationMs === null) return null;

  return (
    <p className="text-sm text-mist">
      <span className="font-medium text-snow">Request time</span>
      <span className="ml-2 tabular-nums text-snow">{formatMs(durationMs)}</span>
      <span className="mt-1 block text-xs leading-relaxed">
        Frontend request duration (upload, analysis wait, and response). Not a model inference
        speed measurement.
      </span>
    </p>
  );
}
