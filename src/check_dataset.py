from pathlib import Path

ROOT = Path(r"dataset\fish_skin_diseases_v6")

classes = [
    "Columnaris Disease",
    "EUS Disease",
    "Gill Disease",
    "Healthy Fish",
    "streptococcus Disease"
]

print("=" * 50)
print("FISH DISEASE DATASET CHECK")
print("=" * 50)

missing = []
invalid = []
class_counts = {i: 0 for i in range(5)}

for split in ["train", "valid", "test"]:
    image_dir = ROOT / split / "images"
    label_dir = ROOT / split / "labels"

    images = list(image_dir.iterdir())
    labels = list(label_dir.glob("*.txt"))

    print(f"\n{split.upper()}")
    print("Images :", len(images))
    print("Labels :", len(labels))

    for image in images:
        label = label_dir / f"{image.stem}.txt"
        if not label.exists():
            missing.append(str(label))

    for label_file in labels:
        try:
            lines = label_file.read_text(encoding="utf-8").splitlines()
        except Exception as e:
            invalid.append((str(label_file), str(e)))
            continue

        for line_number, line in enumerate(lines, 1):
            if not line.strip():
                continue

            parts = line.split()

            if len(parts) != 5:
                invalid.append((str(label_file), line_number, line))
                continue

            try:
                class_id = int(parts[0])
                values = [float(x) for x in parts[1:]]
            except ValueError:
                invalid.append((str(label_file), line_number, line))
                continue

            if class_id not in range(5):
                invalid.append((str(label_file), line_number, line))
                continue

            if not all(0 <= value <= 1 for value in values):
                invalid.append((str(label_file), line_number, line))
                continue

            class_counts[class_id] += 1

print("\n" + "=" * 50)
print("RESULT")
print("=" * 50)

print("Missing labels     :", len(missing))
print("Invalid annotations:", len(invalid))

print("\nBounding boxes by class:")

for i, name in enumerate(classes):
    print(f"{i}: {name} = {class_counts[i]}")

if not missing and not invalid:
    print("\nSTATUS: PASS")
else:
    print("\nSTATUS: CHECK REQUIRED")