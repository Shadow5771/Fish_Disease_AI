from pathlib import Path
import random
import cv2

ROOT = Path(r"dataset\fish_skin_diseases_v6")

classes = [
    "Columnaris Disease",
    "EUS Disease",
    "Gill Disease",
    "Healthy Fish",
    "streptococcus Disease"
]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

COLORS = [
    (255, 0, 0),
    (0, 255, 0),
    (0, 0, 255),
    (255, 255, 0),
    (255, 0, 255),
]

OUTPUT_DIR = Path("results") / "annotation_check"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

random.seed(42)

image_dir = ROOT / "train" / "images"
label_dir = ROOT / "train" / "labels"

images = [
    p for p in image_dir.iterdir()
    if p.suffix.lower() in IMAGE_EXTENSIONS
]

samples = random.sample(images, min(12, len(images)))

print("=" * 60)
print("FISH DISEASE ANNOTATION VISUAL CHECK")
print("=" * 60)
print(f"Images available : {len(images)}")
print(f"Samples selected : {len(samples)}")
print(f"Output directory : {OUTPUT_DIR}")
print()

for index, image_path in enumerate(samples, 1):

    label_path = label_dir / f"{image_path.stem}.txt"

    image = cv2.imread(str(image_path))

    if image is None:
        print(f"[SKIP] Cannot read: {image_path.name}")
        continue

    height, width = image.shape[:2]

    if not label_path.exists():
        print(f"[SKIP] Missing label: {image_path.name}")
        continue

    lines = label_path.read_text(encoding="utf-8").splitlines()

    box_count = 0

    for line in lines:
        if not line.strip():
            continue

        parts = line.split()

        if len(parts) != 5:
            continue

        class_id = int(parts[0])
        x_center, y_center, box_width, box_height = map(float, parts[1:])

        x1 = int((x_center - box_width / 2) * width)
        y1 = int((y_center - box_height / 2) * height)
        x2 = int((x_center + box_width / 2) * width)
        y2 = int((y_center + box_height / 2) * height)

        x1 = max(0, min(x1, width - 1))
        y1 = max(0, min(y1, height - 1))
        x2 = max(0, min(x2, width - 1))
        y2 = max(0, min(y2, height - 1))

        color = COLORS[class_id]

        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            color,
            2
        )

        label = classes[class_id]

        cv2.putText(
            image,
            label,
            (x1, max(20, y1 - 8)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            color,
            2,
            cv2.LINE_AA
        )

        box_count += 1

    output_path = OUTPUT_DIR / f"sample_{index:02d}_{image_path.name}"

    cv2.imwrite(str(output_path), image)

    print(
        f"[{index:02d}/12] "
        f"{image_path.name} -> "
        f"{box_count} boxes"
    )

print()
print("=" * 60)
print("DONE")
print("=" * 60)
print(f"Open this folder:")
print(OUTPUT_DIR.resolve())