import logging
import sys
import threading
import time
from pathlib import Path

import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from consensus import MODEL_NAMES, calculate_consensus, get_primary_prediction  # noqa: E402
from image_quality import assess_image_quality  # noqa: E402
from inference import run_inference  # noqa: E402
from screening_pipeline import FishDiseaseScreeningPipeline  # noqa: E402

log = logging.getLogger("fish_api")

# Same threshold FishDiseaseScreeningPipeline.screen() uses
CONFIDENCE_THRESHOLD = 0.25

QUALITY_ADVISORY = "Image quality may affect screening reliability."
NO_DETECTION_NOTE = "No detection was produced by the evaluated models."


def _r(value, digits):
    return None if value is None else round(float(value), digits)


class ScreeningService:
    """Loads the three models once and runs the existing pipeline steps per request."""

    def __init__(self):
        self.pipeline = FishDiseaseScreeningPipeline()  # loads the 3 models
        self.models = self.pipeline.models
        self._lock = threading.Lock()  # one GPU inference at a time
        self._warm_up()

    def _warm_up(self):
        """First CUDA call is slow; pay that cost at startup, not on the first user."""
        try:
            blank = np.zeros((640, 640, 3), dtype=np.uint8)
            run_inference(self.models, blank, confidence=CONFIDENCE_THRESHOLD)
            log.info("Model warm-up complete.")
        except Exception as exc:  # warm-up is best-effort
            log.warning("Warm-up skipped: %s", exc)

    def screen(self, image_path: Path, display_name: str) -> dict:
        quality = assess_image_quality(image_path)

        model_results, timings = {}, {}
        with self._lock:
            for name, model in self.models.items():
                start = time.perf_counter()
                single = run_inference(
                    {name: model}, str(image_path), confidence=CONFIDENCE_THRESHOLD
                )
                timings[name] = (time.perf_counter() - start) * 1000
                model_results.update(single)

        consensus = calculate_consensus(model_results)
        return self._build_response(display_name, quality, model_results, timings, consensus)

    @staticmethod
    def _build_response(display_name, quality, model_results, timings, consensus) -> dict:
        status = consensus["status"]
        has_result = status in ("CONSENSUS", "PARTIAL CONSENSUS")

        screening_result = {
            "class": consensus["final_class"] if has_result else None,
            "agreement": f"{consensus['consensus_count']}/{consensus['total_models']}",
            "consensus_count": consensus["consensus_count"],
            "detected_models": consensus["detected_models"],
            "total_models": consensus["total_models"],
            "status": status,
            # Confidence stats are only meaningful when there is an agreed class
            "average_confidence": _r(consensus["average_confidence"], 4) if has_result else None,
            "min_confidence": _r(consensus["min_confidence"], 4) if has_result else None,
            "max_confidence": _r(consensus["max_confidence"], 4) if has_result else None,
            "decision_note": consensus.get("decision_note", NO_DETECTION_NOTE),
        }

        models_out = {}
        for name in MODEL_NAMES:
            result = model_results.get(name, {"detections": []})
            primary = get_primary_prediction(result)
            models_out[name] = {
                "class": primary["class_name"] if primary else None,
                "confidence": _r(primary["confidence"], 4) if primary else None,
                "num_detections": len(result["detections"]),
                "inference_ms": round(timings.get(name, 0.0), 1),
                "detections": [
                    {
                        "class_id": d["class_id"],
                        "class": d["class_name"],
                        "confidence": _r(d["confidence"], 4),
                        "bbox": [round(v, 1) for v in d["bbox"]],  # x1, y1, x2, y2 in image pixels
                        "is_primary": d is primary,
                    }
                    for d in result["detections"]
                ],
            }

        image_quality = {
            "resolution": f"{quality['width']}x{quality['height']}",
            "width": quality["width"],
            "height": quality["height"],
            "resolution_status": quality["resolution_status"],
            "brightness": _r(quality["brightness"], 2),
            "brightness_status": quality["brightness_status"],
            "contrast": _r(quality["contrast"], 2),
            "contrast_status": quality["contrast_status"],
            "blur_score": _r(quality["blur_score"], 2),
            "blur_status": quality["blur_status"],
            "status": quality["overall_status"],
            "warnings": quality["warnings"],
            "advisory": QUALITY_ADVISORY if quality["warnings"] else None,
        }

        return {
            "screening_result": screening_result,
            "models": models_out,
            "image_quality": image_quality,
            "meta": {
                "filename": display_name,
                "confidence_threshold": CONFIDENCE_THRESHOLD,
                "selection_rule": "highest-confidence detection per model",
            },
        }