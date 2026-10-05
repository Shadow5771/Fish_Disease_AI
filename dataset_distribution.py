from pathlib import Path
from collections import defaultdict
import hashlib

DATASET = Path("dataset") / "Freshwater Fish Disease Aquaculture in south asia"

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}

splits = {}

for split in ["Train", "Test"]:
    split_data = defaultdict(list)

    for class_dir in sorted((DATASET / split).iterdir()):
        if not class_dir.is_dir():
            continue

        for img_path in class_dir.iterdir():
            if img_path.suffix.lower() not in IMAGE_EXTS:
                continue

            file_hash = hashlib.md5(img_path.read_bytes()).hexdigest()
            split_data[class_dir.name].append(file_hash)

    splits[split] = split_data


print("\n" + "=" * 75)
print("DATASET DUPLICATION DISTRIBUTION")
print("=" * 75)

for class_name in splits["Train"]:

    train_hashes = set(splits["Train"][class_name])
    test_hashes = set(splits["Test"][class_name])

    common = train_hashes & test_hashes

    print(f"\n{class_name}")
    print("-" * 75)

    print(f"Train images              : {len(splits['Train'][class_name])}")
    print(f"Test images               : {len(splits['Test'][class_name])}")
    print(f"Unique Train images       : {len(train_hashes)}")
    print(f"Unique Test images        : {len(test_hashes)}")
    print(f"Same-class shared hashes : {len(common)}")

    train_only = train_hashes - test_hashes
    test_only = test_hashes - train_hashes

    print(f"Train-only unique         : {len(train_only)}")
    print(f"Test-only unique          : {len(test_only)}")

print("\n" + "=" * 75)
print("COMPLETE")
print("=" * 75)