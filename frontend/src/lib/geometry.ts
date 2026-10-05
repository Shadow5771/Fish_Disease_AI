import type { BBox } from "../types/screening";

export interface ContainLayout {
  offsetX: number;
  offsetY: number;
  scale: number;
  contentWidth: number;
  contentHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}

/**
 * Maps object-contain letterboxing inside an <img>.
 * Displayed size can differ from the analysed image; bbox mapping uses both.
 */
export function measureObjectContain(img: HTMLImageElement): ContainLayout | null {
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  const elW = img.clientWidth;
  const elH = img.clientHeight;
  if (!naturalWidth || !naturalHeight || !elW || !elH) return null;

  const scale = Math.min(elW / naturalWidth, elH / naturalHeight);
  const contentWidth = naturalWidth * scale;
  const contentHeight = naturalHeight * scale;

  return {
    offsetX: (elW - contentWidth) / 2,
    offsetY: (elH - contentHeight) / 2,
    scale,
    contentWidth,
    contentHeight,
    naturalWidth,
    naturalHeight,
  };
}

export function bboxToDisplay(
  bbox: BBox,
  analysisWidth: number,
  analysisHeight: number,
  layout: ContainLayout,
) {
  const [x1, y1, x2, y2] = bbox;
  const sx = layout.naturalWidth / analysisWidth;
  const sy = layout.naturalHeight / analysisHeight;
  return {
    x: layout.offsetX + x1 * sx * layout.scale,
    y: layout.offsetY + y1 * sy * layout.scale,
    w: Math.max(0, (x2 - x1) * sx * layout.scale),
    h: Math.max(0, (y2 - y1) * sy * layout.scale),
  };
}
