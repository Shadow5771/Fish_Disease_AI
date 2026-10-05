import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  bboxToDisplay,
  measureObjectContain,
  type ContainLayout,
} from "../lib/geometry";
import { MODEL_ACCENT } from "../lib/models";
import { usePrefersReducedMotion } from "../hooks/useMedia";
import type {
  Detection,
  DetectionViewMode,
  ImageQuality,
  ModelName,
  ModelResult,
  ScreeningResponse,
} from "../types/screening";
import { MODEL_NAMES } from "../types/screening";
import { ModelSwitcher } from "./ModelSwitcher";

interface OverlayDetection {
  key: string;
  model: ModelName;
  detection: Detection;
}

interface Frame {
  left: number;
  top: number;
  width: number;
  height: number;
  layout: ContainLayout;
}

interface Props {
  previewUrl: string;
  filename: string;
  result: ScreeningResponse | null;
  view: DetectionViewMode;
  onViewChange: (view: DetectionViewMode) => void;
}

function collectDetections(
  models: Record<ModelName, ModelResult>,
  view: DetectionViewMode,
): OverlayDetection[] {
  const names: ModelName[] =
    view === "combined" ? [...MODEL_NAMES] : [view];

  const items: OverlayDetection[] = [];

  for (const model of names) {
    models[model].detections.forEach((detection, index) => {
      items.push({
        key: `${model}-${index}`,
        model,
        detection,
      });
    });
  }

  return items;
}

function OverlayBox({
  item,
  layout,
  quality,
  combined,
}: {
  item: OverlayDetection;
  layout: ContainLayout;
  quality: ImageQuality;
  combined: boolean;
}) {
  const box = bboxToDisplay(
    item.detection.bbox,
    quality.width,
    quality.height,
    layout,
  );

  const color = MODEL_ACCENT[item.model];
  const primary = item.detection.is_primary;

  const label = `${item.detection.class} ${(item.detection.confidence * 100).toFixed(1)}%`;

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{
        left: box.x,
        top: box.y,
        width: Math.max(box.w, 2),
        height: Math.max(box.h, 2),
      }}
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: primary ? 1 : 0.82, scale: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {/* Main bounding box */}
      <div
        className="absolute inset-0 rounded-[2px]"
        style={{
          border: `${primary ? 2 : 1.25}px ${
            primary ? "solid" : "dashed"
          } ${color}`,
          boxShadow: primary
            ? `inset 0 0 0 1px rgba(5,10,21,0.45), 0 0 12px ${color}33`
            : undefined,
        }}
      />

      {/* Corner accents */}
      {primary && (
        <>
          <span
            className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2"
            style={{ borderColor: color }}
          />
          <span
            className="absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2"
            style={{ borderColor: color }}
          />
          <span
            className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2"
            style={{ borderColor: color }}
          />
          <span
            className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2"
            style={{ borderColor: color }}
          />
        </>
      )}

      {/* Detection label */}
      <div
        className="absolute left-0 top-0 max-w-[min(260px,100%)] -translate-y-full truncate rounded-t-[3px] px-2 py-1 text-[9px] font-semibold uppercase leading-none tracking-[0.12em]"
        style={{
          background: "rgba(5, 10, 21, 0.94)",
          color,
          border: `1px solid ${color}55`,
          borderBottom: "none",
          backdropFilter: "blur(8px)",
        }}
      >
        {combined ? `${item.model} · ${label}` : label}
      </div>
    </motion.div>
  );
}

function ViewerStatus({
  result,
  view,
}: {
  result: ScreeningResponse | null;
  view: DetectionViewMode;
}) {
  if (!result) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        Awaiting analysis
      </div>
    );
  }

  const count =
    view === "combined"
      ? Object.values(result.models).reduce(
          (total, model) => total + model.num_detections,
          0,
        )
      : result.models[view].num_detections;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <span className="flex items-center gap-2 text-mist">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        Analysis ready
      </span>

      <span className="text-muted">
        {count} {count === 1 ? "detection" : "detections"}
      </span>

      <span className="hidden text-muted sm:inline">
        {result.image_quality.width} × {result.image_quality.height}
      </span>
    </div>
  );
}

export function DetectionViewer({
  previewUrl,
  filename,
  result,
  view,
  onViewChange,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [frame, setFrame] = useState<Frame | null>(null);

  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const update = () => {
      const layout = measureObjectContain(img);

      if (!layout) return;

      setFrame({
        left: img.offsetLeft,
        top: img.offsetTop,
        width: img.clientWidth,
        height: img.clientHeight,
        layout,
      });
    };

    update();

    img.addEventListener("load", update);

    const ro = new ResizeObserver(update);
    ro.observe(img);

    if (stageRef.current) {
      ro.observe(stageRef.current);
    }

    return () => {
      img.removeEventListener("load", update);
      ro.disconnect();
    };
  }, [
    previewUrl,
    result?.image_quality.width,
    result?.image_quality.height,
  ]);

  const overlays = useMemo(() => {
    if (!result) return [];

    return collectDetections(result.models, view);
  }, [result, view]);

  return (
    <section
      className="card min-w-0 overflow-hidden p-5 sm:p-6"
      aria-label="Detection viewer"
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="eyebrow">Image + detections</p>

            {result && (
              <span className="rounded-full border border-accent/20 bg-accent/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-accent">
                Live
              </span>
            )}
          </div>

          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Detection viewer
          </h2>

          <p className="mt-1 max-w-xl truncate text-xs text-muted">
            {filename}
          </p>
        </div>

        {result && (
          <div className="shrink-0">
            <ModelSwitcher
              value={view}
              onChange={onViewChange}
            />
          </div>
        )}
      </div>

      {/* Viewer stage */}
      <div
        ref={stageRef}
        className="group relative mt-5 overflow-hidden rounded-xl border border-line bg-ink-950 shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]"
      >
        {/* Technical frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-xl"
        >
          <span className="absolute left-3 top-3 h-5 w-5 border-l border-t border-white/10" />
          <span className="absolute right-3 top-3 h-5 w-5 border-r border-t border-white/10" />
          <span className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-white/10" />
          <span className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-white/10" />
        </div>

        {/* Subtle scan line */}
        {result && !reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 z-10 h-px bg-accent/20 shadow-[0_0_18px_rgba(92,200,232,0.25)]"
            initial={{ top: "0%" }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <img
          ref={imgRef}
          src={previewUrl}
          alt={`Selected fish image: ${filename}`}
          className="block max-h-[min(62vh,540px)] w-full object-contain transition-transform duration-500 group-hover:scale-[1.003]"
        />

        {/* Detection overlays */}
        {frame && result && (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              className="pointer-events-none absolute"
              style={{
                left: frame.left,
                top: frame.top,
                width: frame.width,
                height: frame.height,
              }}
              initial={
                reduced
                  ? false
                  : {
                      opacity: 0,
                    }
              }
              animate={{
                opacity: 1,
              }}
              exit={
                reduced
                  ? undefined
                  : {
                      opacity: 0,
                    }
              }
              transition={{
                duration: reduced ? 0 : 0.2,
              }}
            >
              {overlays.map((item) => (
                <OverlayBox
                  key={item.key}
                  item={item}
                  layout={frame.layout}
                  quality={result.image_quality}
                  combined={view === "combined"}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty / waiting state */}
        {!result && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/20">
            <div className="rounded-xl border border-line bg-ink-900/65 px-5 py-4 text-center backdrop-blur-md">
              <p className="text-xs font-medium text-mist">
                Upload an image to begin screening
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                Detection overlay will appear here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Viewer status */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ViewerStatus result={result} view={view} />

        {result && (
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted">
            {view === "combined"
              ? "Ensemble overlay"
              : `${view} overlay`}
          </span>
        )}
      </div>

      {/* Technical explanation */}
      <div className="mt-4 rounded-lg border border-line bg-ink-900/25 px-4 py-3">
        <p className="text-xs leading-relaxed text-mist">
          Bounding boxes use analysed-image coordinates
          {result
            ? ` (${result.image_quality.width} × ${result.image_quality.height})`
            : ""}{" "}
          and are scaled to the object-contained preview. Solid outlines
          indicate primary detections; dashed outlines indicate additional
          detections.
          {view === "combined"
            ? " Combined view identifies the model responsible for each detection."
            : ""}
        </p>
      </div>
    </section>
  );
}