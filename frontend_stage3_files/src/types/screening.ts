// Mirrors the JSON returned by POST /api/screen

export type ModelName = "YOLO11n" | "YOLO11s" | "YOLO26n";

export type ConsensusStatus =
  | "CONSENSUS"
  | "PARTIAL CONSENSUS"
  | "NO CONSENSUS"
  | "NO DETECTION";

// x1, y1, x2, y2 in pixels of the analysed image (image_quality.width x height)
export type BBox = [number, number, number, number];

export interface Detection {
  class_id: number;
  class: string;
  confidence: number;
  bbox: BBox;
  is_primary: boolean;
}

export interface ModelResult {
  class: string | null;
  confidence: number | null;
  num_detections: number;
  inference_ms: number;
  detections: Detection[];
}

export interface ScreeningResult {
  class: string | null;
  agreement: string;
  consensus_count: number;
  detected_models: number;
  total_models: number;
  status: ConsensusStatus;
  average_confidence: number | null;
  min_confidence: number | null;
  max_confidence: number | null;
  decision_note: string;
}

export interface ImageQuality {
  resolution: string;
  width: number;
  height: number;
  resolution_status: string;
  brightness: number;
  brightness_status: string;
  contrast: number;
  contrast_status: string;
  blur_score: number;
  blur_status: string;
  status: string;
  warnings: string[];
  advisory: string | null;
}

export interface ScreeningResponse {
  screening_result: ScreeningResult;
  models: Record<ModelName, ModelResult>;
  image_quality: ImageQuality;
  meta: {
    filename: string;
    confidence_threshold: number;
    selection_rule: string;
  };
}

// UI state
export type ViewStatus = "idle" | "loading" | "done" | "error";

export interface ViewError {
  code: string;
  message: string;
}