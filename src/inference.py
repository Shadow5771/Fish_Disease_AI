from pathlib import Path
from ultralytics import YOLO


# ---------------------------------------------------------
# Project paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATHS = {
    "YOLO11n": PROJECT_ROOT / "runs" / "detect" / "results" / "training"
                       / "yolo11n_baseline" / "weights" / "best.pt",

    "YOLO11s": PROJECT_ROOT / "runs" / "detect" / "results" / "training"
                       / "yolo11s_baseline" / "weights" / "best.pt",

    "YOLO26n": PROJECT_ROOT / "runs" / "detect" / "results" / "training"
                       / "yolo26n_baseline" / "weights" / "best.pt",
}


# ---------------------------------------------------------
# Class names
# ---------------------------------------------------------

CLASS_NAMES = [
    "Columnaris Disease",
    "EUS Disease",
    "Gill Disease",
    "Healthy Fish",
    "Streptococcus Disease",
]


# ---------------------------------------------------------
# Load models
# ---------------------------------------------------------

def load_models():
    """
    Load all three trained YOLO models.
    """

    models = {}

    for model_name, model_path in MODEL_PATHS.items():

        if not model_path.exists():
            raise FileNotFoundError(
                f"Model file not found: {model_path}"
            )

        print(f"Loading {model_name}...")
        models[model_name] = YOLO(str(model_path))

    return models


# ---------------------------------------------------------
# Run inference
# ---------------------------------------------------------

def run_inference(models, image_path, confidence=0.25):
    """
    Run the same image through all three models.

    Returns a dictionary containing the raw detection
    information from every model.
    """

    results = {}

    for model_name, model in models.items():

        prediction = model.predict(
            source=image_path,
            imgsz=640,
            conf=confidence,
            device=0,
            verbose=False
        )[0]

        detections = []

        if prediction.boxes is not None:

            for box in prediction.boxes:

                class_id = int(box.cls[0])
                conf_score = float(box.conf[0])

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class_id": class_id,
                    "class_name": CLASS_NAMES[class_id],
                    "confidence": conf_score,
                    "bbox": [x1, y1, x2, y2]
                })

        results[model_name] = {
            "detections": detections,
            "num_detections": len(detections)
        }

    return results


# ---------------------------------------------------------
# Test module directly
# ---------------------------------------------------------

if __name__ == "__main__":

    print("=" * 60)
    print("FISH DISEASE AI - MODEL INFERENCE TEST")
    print("=" * 60)

    models = load_models()

    print("\nAll three models loaded successfully.")

    for name, model in models.items():
        print(f"  {name}: {model.__class__.__name__}")

    print("\nInference engine ready.")