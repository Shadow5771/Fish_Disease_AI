from pathlib import Path
from ultralytics import YOLO

MODEL_PATH = Path(
    r"runs\detect\results\training\yolo11n_baseline\weights\best.pt"
)

IMAGE_PATH = Path(r"sample.jpg")

OUTPUT_DIR = Path("results") / "predictions"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}\n"
        "Wait for YOLO training to finish."
    )

if not IMAGE_PATH.exists():
    raise FileNotFoundError(
        f"Image not found: {IMAGE_PATH}\n"
        "Put a test fish image in the project root and name it sample.jpg."
    )

model = YOLO(str(MODEL_PATH))

results = model.predict(
    source=str(IMAGE_PATH),
    imgsz=640,
    conf=0.25,
    device=0,
    save=True,
    project=str(OUTPUT_DIR),
    name="single_prediction"
)

print("=" * 60)
print("FISH DISEASE PREDICTION")
print("=" * 60)

for result in results:

    if result.boxes is None or len(result.boxes) == 0:
        print("No disease/object detected.")
        continue

    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])

        class_name = model.names[class_id]

        print(
            f"Detection: {class_name} | "
            f"Confidence: {confidence:.2%}"
        )

print()
print("Prediction image saved in:")
print(OUTPUT_DIR.resolve())