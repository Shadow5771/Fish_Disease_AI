from pathlib import Path
from PIL import Image
from collections import Counter
import hashlib

DATASET = Path("dataset") / "Freshwater Fish Disease Aquaculture in south asia"

image_exts = {".jpg", ".jpeg", ".png"}

total = 0
corrupt = []
dimensions = Counter()
extensions = Counter()
hashes = {}
duplicates = []

for split in ["Train", "Test"]:
    split_path = DATASET / split

    for class_dir in sorted(split_path.iterdir()):
        if not class_dir.is_dir():
            continue

        for img_path in class_dir.iterdir():
            if img_path.suffix.lower() not in image_exts:
                continue

            total += 1
            extensions[img_path.suffix.lower()] += 1

            # Check image validity and dimensions
            try:
                with Image.open(img_path) as img:
                    img.verify()

                with Image.open(img_path) as img:
                    dimensions[img.size] += 1

            except Exception as e:
                corrupt.append((str(img_path), str(e)))
                continue

            # Calculate file hash for duplicate detection
            try:
                file_hash = hashlib.md5(img_path.read_bytes()).hexdigest()

                if file_hash in hashes:
                    duplicates.append(
                        (str(img_path), hashes[file_hash])
                    )
                else:
                    hashes[file_hash] = str(img_path)

            except Exception:
                pass


print("\n" + "=" * 60)
print("FISH DISEASE DATASET AUDIT")
print("=" * 60)

print(f"\nTotal images checked : {total}")
print(f"Valid images         : {total - len(corrupt)}")
print(f"Corrupt images       : {len(corrupt)}")
print(f"Exact duplicates     : {len(duplicates)}")

print("\nImage formats:")
for ext, count in extensions.items():
    print(f"  {ext:6} : {count}")

print("\nMost common image dimensions:")
for size, count in dimensions.most_common(15):
    print(f"  {size[0]} x {size[1]} : {count}")

if corrupt:
    print("\nCORRUPT FILES:")
    for path, error in corrupt[:20]:
        print(f"  {path}")
        print(f"    {error}")

if duplicates:
    print("\nEXACT DUPLICATES:")
    for duplicate, original in duplicates[:20]:
        print(f"  Duplicate : {duplicate}")
        print(f"  Original  : {original}")

print("\n" + "=" * 60)
print("AUDIT COMPLETE")
print("=" * 60)