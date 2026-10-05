from pathlib import Path
import shutil
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

# ============================================================
# CONFIGURATION
# ============================================================

BASE = Path("dataset/fish_skin_diseases_v6")
SOURCE_IMAGES = BASE / "valid/images"
SOURCE_LABELS = BASE / "valid/labels"
OUTPUT_ROOT = BASE / "robustness"

BLUR_RADIUS = 2.0
NOISE_SIGMA = 20
BRIGHTNESS_FACTOR = 0.60
CONTRAST_FACTOR = 0.60
JPEG_QUALITY = 30
LOW_RES_SCALE = 0.50

RANDOM_SEED = 42


# ============================================================
# DEGRADATION FUNCTIONS
# ============================================================

def apply_blur(image):
    return image.filter(
        ImageFilter.GaussianBlur(radius=BLUR_RADIUS)
    )


def apply_noise(image):
    arr = np.array(image).astype(np.float32)

    rng = np.random.default_rng(RANDOM_SEED)
    noise = rng.normal(0, NOISE_SIGMA, arr.shape)

    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)

    return Image.fromarray(arr)


def apply_brightness(image):
    return ImageEnhance.Brightness(
        image
    ).enhance(BRIGHTNESS_FACTOR)


def apply_contrast(image):
    return ImageEnhance.Contrast(
        image
    ).enhance(CONTRAST_FACTOR)


def apply_compression(image):
    return image


def apply_low_resolution(image):
    original_size = image.size

    small_size = (
        max(1, int(original_size[0] * LOW_RES_SCALE)),
        max(1, int(original_size[1] * LOW_RES_SCALE))
    )

    image = image.resize(
        small_size,
        Image.Resampling.BILINEAR
    )

    image = image.resize(
        original_size,
        Image.Resampling.BILINEAR
    )

    return image


CONDITIONS = {
    "blur": apply_blur,
    "noise": apply_noise,
    "brightness": apply_brightness,
    "contrast": apply_contrast,
    "compression": apply_compression,
    "low_resolution": apply_low_resolution,
}


# ============================================================
# CHECK SOURCE DATA
# ============================================================

image_files = sorted(
    [
        p for p in SOURCE_IMAGES.iterdir()
        if p.suffix.lower() in {".jpg", ".jpeg", ".png"}
    ]
)

label_files = sorted(
    [
        p for p in SOURCE_LABELS.iterdir()
        if p.suffix.lower() == ".txt"
    ]
)

print("=" * 60)
print("ROBUSTNESS DATASET GENERATION")
print("=" * 60)

print(f"Source images : {len(image_files)}")
print(f"Source labels : {len(label_files)}")

if len(image_files) != 185:
    raise RuntimeError(
        f"Expected 185 validation images, found {len(image_files)}"
    )

if len(label_files) != 185:
    raise RuntimeError(
        f"Expected 185 validation labels, found {len(label_files)}"
    )


# ============================================================
# GENERATE DATASETS
# ============================================================

for condition, transform in CONDITIONS.items():

    print()
    print(f"Creating: {condition}")

    output_images = OUTPUT_ROOT / condition / "images"
    output_labels = OUTPUT_ROOT / condition / "labels"

    output_images.mkdir(parents=True, exist_ok=True)
    output_labels.mkdir(parents=True, exist_ok=True)

    processed = 0

    for index, image_path in enumerate(image_files, start=1):

        # Find corresponding original YOLO label
        label_path = SOURCE_LABELS / f"{image_path.stem}.txt"

        if not label_path.exists():
            raise FileNotFoundError(
                f"Missing label for image: {image_path.name}"
            )

        # ----------------------------------------------------
        # Use short filenames to avoid Windows path-length
        # problems.
        # ----------------------------------------------------

        output_stem = f"img_{index:04d}"

        output_image = output_images / f"{output_stem}.jpg"
        output_label = output_labels / f"{output_stem}.txt"

        # Open original image
        image = Image.open(image_path).convert("RGB")

        # Apply degradation
        degraded = transform(image)

        # Save degraded image
        if condition == "compression":

            degraded.save(
                output_image,
                format="JPEG",
                quality=JPEG_QUALITY,
                optimize=True
            )

        else:

            degraded.save(
                output_image,
                format="JPEG",
                quality=95
            )

        # Copy original YOLO annotation
        shutil.copy2(
            label_path,
            output_label
        )

        processed += 1

    print(f"Completed: {processed} images")


# ============================================================
# VERIFY OUTPUT
# ============================================================

print()
print("=" * 60)
print("ROBUSTNESS DATASET GENERATION COMPLETE")
print("=" * 60)

for condition in CONDITIONS:

    image_dir = OUTPUT_ROOT / condition / "images"
    label_dir = OUTPUT_ROOT / condition / "labels"

    image_count = len(
        [
            p for p in image_dir.iterdir()
            if p.suffix.lower() == ".jpg"
        ]
    )

    label_count = len(
        [
            p for p in label_dir.iterdir()
            if p.suffix.lower() == ".txt"
        ]
    )

    print(
        f"{condition:15s} -> "
        f"images: {image_count:3d}, "
        f"labels: {label_count:3d}"
    )