from pathlib import Path
from PIL import Image
import hashlib
import numpy as np
from collections import defaultdict

# ============================================================
# FISH DISEASE DATASET - NEAR DUPLICATE AUDIT
# ============================================================
# READ-ONLY AUDIT
# Checks:
# 1. Exact duplicates using MD5
# 2. Near-duplicates using perceptual image hashes
# 3. Train <-> Test leakage
# 4. Cross-class conflicts
#
# Nothing is deleted or modified.
# ============================================================

DATASET = Path("dataset") / "Freshwater Fish Disease Aquaculture in south asia"

IMAGE_EXTS = {".jpg", ".jpeg", ".png"}

# Lower = stricter similarity
# 0-2  = extremely similar
# 3-5  = likely near-duplicate
# 6+   = progressively less similar
PHASH_THRESHOLD = 5

HASH_SIZE = 16


# ------------------------------------------------------------
# IMAGE COLLECTION
# ------------------------------------------------------------

def collect_images():
    images = []

    for split in ["Train", "Test"]:
        split_dir = DATASET / split

        if not split_dir.exists():
            print(f"ERROR: Missing folder: {split_dir}")
            return []

        for class_dir in sorted(split_dir.iterdir()):
            if not class_dir.is_dir():
                continue

            for img_path in sorted(class_dir.iterdir()):
                if img_path.suffix.lower() not in IMAGE_EXTS:
                    continue

                images.append({
                    "path": img_path,
                    "split": split,
                    "class": class_dir.name
                })

    return images


# ------------------------------------------------------------
# MD5 EXACT HASH
# ------------------------------------------------------------

def md5_hash(path):
    h = hashlib.md5()

    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)

    return h.hexdigest()


# ------------------------------------------------------------
# SIMPLE PERCEPTUAL HASH
# ------------------------------------------------------------

def phash(path):
    """
    Creates a simple perceptual hash.

    The image is:
    - converted to grayscale
    - resized
    - transformed using DCT
    - compared against the median frequency value
    """

    try:
        img = Image.open(path).convert("L")

        # Resize for DCT
        img = img.resize((32, 32), Image.Resampling.LANCZOS)

        pixels = np.asarray(img, dtype=np.float32)

        # 2D DCT implemented using cosine matrices
        n = pixels.shape[0]

        x = np.arange(n)
        k = np.arange(n)

        cos_matrix = np.cos(
            np.pi / n * (x[:, None] + 0.5) * k[None, :]
        )

        dct = cos_matrix.T @ pixels @ cos_matrix

        # Use low-frequency 16x16 region
        low_freq = dct[:HASH_SIZE, :HASH_SIZE]

        # Ignore DC component
        median = np.median(low_freq[1:])

        bits = low_freq > median

        return bits.flatten()

    except Exception as e:
        print(f"ERROR processing: {path}")
        print(f"       {e}")
        return None


# ------------------------------------------------------------
# HAMMING DISTANCE
# ------------------------------------------------------------

def hamming_distance(hash1, hash2):
    return int(np.sum(hash1 != hash2))


# ------------------------------------------------------------
# MAIN
# ------------------------------------------------------------

print("\n" + "=" * 75)
print("FISH DISEASE DATASET - NEAR DUPLICATE AUDIT")
print("=" * 75)

print("\nDataset:")
print(DATASET)

images = collect_images()

if not images:
    print("\nNo images found.")
    exit()

print(f"\nTotal images found: {len(images)}")

# ------------------------------------------------------------
# STEP 1 - EXACT DUPLICATES
# ------------------------------------------------------------

print("\n" + "=" * 75)
print("STEP 1 - EXACT DUPLICATE ANALYSIS")
print("=" * 75)

md5_groups = defaultdict(list)

for i, item in enumerate(images, 1):

    file_hash = md5_hash(item["path"])

    item["md5"] = file_hash

    md5_groups[file_hash].append(item)

    if i % 250 == 0 or i == len(images):
        print(f"Processed: {i}/{len(images)}")

exact_groups = [
    group for group in md5_groups.values()
    if len(group) > 1
]

cross_split_exact = []
cross_class_exact = []

for group in exact_groups:

    splits = set(x["split"] for x in group)
    classes = set(x["class"] for x in group)

    if len(splits) > 1:
        cross_split_exact.append(group)

    if len(classes) > 1:
        cross_class_exact.append(group)

print("\nExact duplicate groups       :", len(exact_groups))
print("Train/Test exact groups      :", len(cross_split_exact))
print("Cross-class exact groups     :", len(cross_class_exact))


# ------------------------------------------------------------
# PRINT CROSS-CLASS EXACT CONFLICTS
# ------------------------------------------------------------

if cross_class_exact:

    print("\n" + "=" * 75)
    print("CROSS-CLASS EXACT DUPLICATES")
    print("=" * 75)

    for number, group in enumerate(cross_class_exact, 1):

        print(f"\nConflict #{number}")

        for item in group:
            print(
                f"  [{item['split']}] "
                f"{item['class']}"
            )
            print(f"      {item['path']}")


# ------------------------------------------------------------
# STEP 2 - PERCEPTUAL HASH
# ------------------------------------------------------------

print("\n" + "=" * 75)
print("STEP 2 - PERCEPTUAL HASH ANALYSIS")
print("=" * 75)

print("\nGenerating perceptual hashes...")

valid_images = []

for i, item in enumerate(images, 1):

    item["phash"] = phash(item["path"])

    if item["phash"] is not None:
        valid_images.append(item)

    if i % 250 == 0 or i == len(images):
        print(f"Processed: {i}/{len(images)}")

print("\nValid perceptual hashes:", len(valid_images))


# ------------------------------------------------------------
# STEP 3 - COMPARE TRAIN VS TEST
# ------------------------------------------------------------

print("\n" + "=" * 75)
print("STEP 3 - TRAIN <-> TEST NEAR-DUPLICATE SEARCH")
print("=" * 75)

train_images = [
    x for x in valid_images
    if x["split"] == "Train"
]

test_images = [
    x for x in valid_images
    if x["split"] == "Test"
]

print(f"\nTrain images: {len(train_images)}")
print(f"Test images : {len(test_images)}")

near_duplicates = []

total_comparisons = len(train_images) * len(test_images)

print(f"\nComparisons required: {total_comparisons:,}")
print("Searching...\n")

comparison_count = 0

for train_item in train_images:

    for test_item in test_images:

        distance = hamming_distance(
            train_item["phash"],
            test_item["phash"]
        )

        if distance <= PHASH_THRESHOLD:

            near_duplicates.append({
                "distance": distance,
                "train": train_item,
                "test": test_item
            })

        comparison_count += 1

    if len(near_duplicates) % 100 == 0:
        pass

print("\nNear-duplicate pairs found:", len(near_duplicates))


# ------------------------------------------------------------
# SORT BY SIMILARITY
# ------------------------------------------------------------

near_duplicates.sort(
    key=lambda x: x["distance"]
)


# ------------------------------------------------------------
# SUMMARY
# ------------------------------------------------------------

same_class_near = []
cross_class_near = []

for pair in near_duplicates:

    train_class = pair["train"]["class"]
    test_class = pair["test"]["class"]

    if train_class == test_class:
        same_class_near.append(pair)
    else:
        cross_class_near.append(pair)

print("\n" + "=" * 75)
print("NEAR-DUPLICATE SUMMARY")
print("=" * 75)

print("\nThreshold:", PHASH_THRESHOLD)

print("Total near-duplicate pairs :", len(near_duplicates))
print("Same-class near-duplicates :", len(same_class_near))
print("Cross-class near-duplicates:", len(cross_class_near))


# ------------------------------------------------------------
# CROSS-SPLIT CROSS-CLASS NEAR DUPLICATES
# ------------------------------------------------------------

if cross_class_near:

    print("\n" + "=" * 75)
    print("IMPORTANT: CROSS-CLASS NEAR-DUPLICATES")
    print("=" * 75)

    # Show strongest matches first
    for number, pair in enumerate(
        cross_class_near[:100], 1
    ):

        print(f"\nConflict #{number}")
        print(f"Perceptual distance: {pair['distance']}")

        print("\nTRAIN:")
        print(f"  Class: {pair['train']['class']}")
        print(f"  File : {pair['train']['path']}")

        print("\nTEST:")
        print(f"  Class: {pair['test']['class']}")
        print(f"  File : {pair['test']['path']}")


# ------------------------------------------------------------
# STRONGEST SAME-CLASS MATCHES
# ------------------------------------------------------------

print("\n" + "=" * 75)
print("STRONGEST SAME-CLASS NEAR-DUPLICATES")
print("=" * 75)

for number, pair in enumerate(
    same_class_near[:50], 1
):

    print(
        f"\n#{number} "
        f"Distance={pair['distance']}"
    )

    print(
        f"TRAIN: {pair['train']['path']}"
    )

    print(
        f"TEST : {pair['test']['path']}"
    )


# ------------------------------------------------------------
# FINAL INTERPRETATION
# ------------------------------------------------------------

print("\n" + "=" * 75)
print("AUDIT COMPLETE")
print("=" * 75)

print("""
IMPORTANT:

This script has NOT modified your dataset.

Interpretation of perceptual distance:

0-2  : extremely strong visual match
3-5  : strong near-duplicate candidate
6+   : weaker similarity

Do NOT automatically delete images based only on this result.

The next step is to inspect the reported conflicts and
create a leakage-free dataset split.
""")

print("=" * 75)