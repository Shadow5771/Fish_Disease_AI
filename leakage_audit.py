from pathlib import Path
from collections import defaultdict
import hashlib

DATASET = Path("dataset") / "Freshwater Fish Disease Aquaculture in south asia"

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}

# hash -> list of (split, class, path)
hash_map = defaultdict(list)

for split in ["Train", "Test"]:
    split_path = DATASET / split

    for class_dir in sorted(split_path.iterdir()):
        if not class_dir.is_dir():
            continue

        for img_path in class_dir.iterdir():
            if img_path.suffix.lower() not in IMAGE_EXTS:
                continue

            file_hash = hashlib.md5(img_path.read_bytes()).hexdigest()

            hash_map[file_hash].append(
                (split, class_dir.name, str(img_path))
            )


# Counters
train_internal = 0
test_internal = 0
train_test_same_class = 0
train_test_cross_class = 0

train_test_groups = []

for file_hash, items in hash_map.items():

    splits = {item[0] for item in items}
    classes = {item[1] for item in items}

    if len(items) > 1:

        # Duplicate inside Train
        train_items = [x for x in items if x[0] == "Train"]
        if len(train_items) > 1:
            train_internal += len(train_items) - 1

        # Duplicate inside Test
        test_items = [x for x in items if x[0] == "Test"]
        if len(test_items) > 1:
            test_internal += len(test_items) - 1

        # Train/Test leakage
        if "Train" in splits and "Test" in splits:

            if len(classes) == 1:
                train_test_same_class += 1
            else:
                train_test_cross_class += 1

            train_test_groups.append(items)


print("\n" + "=" * 70)
print("TRAIN / TEST DATA LEAKAGE AUDIT")
print("=" * 70)

print(f"\nUnique image hashes       : {len(hash_map)}")
print(f"Train internal duplicates : {train_internal}")
print(f"Test internal duplicates  : {test_internal}")

print("\nTRAIN ↔ TEST LEAKAGE")
print("-" * 70)

print(f"Same-class duplicate groups  : {train_test_same_class}")
print(f"Cross-class duplicate groups : {train_test_cross_class}")
print(f"Total leakage groups         : {len(train_test_groups)}")

# Count number of affected files
affected_train = set()
affected_test = set()

for group in train_test_groups:
    for split, class_name, path in group:
        if split == "Train":
            affected_train.add(path)
        else:
            affected_test.add(path)

print(f"\nAffected Train images : {len(affected_train)}")
print(f"Affected Test images  : {len(affected_test)}")

print("\nFIRST 30 TRAIN ↔ TEST LEAKAGE GROUPS")
print("-" * 70)

for i, group in enumerate(train_test_groups[:30], 1):

    print(f"\nGroup {i}:")

    for split, class_name, path in group:
        print(f"  {split:5} | {class_name}")
        print(f"         {path}")

print("\n" + "=" * 70)
print("AUDIT COMPLETE")
print("=" * 70)