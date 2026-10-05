import type { DetectionViewMode } from "../types/screening";

interface Props {
  value: DetectionViewMode;
  onChange: (value: DetectionViewMode) => void;
}

const OPTIONS: {
  value: DetectionViewMode;
  label: string;
}[] = [
  { value: "YOLO11n", label: "YOLO11n" },
  { value: "YOLO11s", label: "YOLO11s" },
  { value: "YOLO26n", label: "YOLO26n" },
  { value: "combined", label: "Combined" },
];

export function ModelSwitcher({ value, onChange }: Props) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Detection model view"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              selected
                ? "border-accent/60 bg-accent/10 text-accent"
                : "border-line bg-ink-900/50 text-mist hover:border-line-bright hover:text-snow"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}