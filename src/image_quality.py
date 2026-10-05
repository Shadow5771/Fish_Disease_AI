from pathlib import Path

import cv2
import numpy as np


# ---------------------------------------------------------
# Image Quality Assessment
# ---------------------------------------------------------

def assess_image_quality(image_path):
    """
    Assess basic image quality before AI screening.

    Checks:
        - Resolution
        - Brightness
        - Contrast
        - Blur

    Returns a structured quality report.
    """

    image_path = Path(image_path)

    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError(
            f"Unable to read image: {image_path}"
        )

    # -----------------------------------------------------
    # Resolution
    # -----------------------------------------------------

    height, width = image.shape[:2]

    resolution = width * height

    if width < 160 or height < 160:
        resolution_status = "LOW"
    elif width < 320 or height < 320:
        resolution_status = "MODERATE"
    else:
        resolution_status = "GOOD"

    # -----------------------------------------------------
    # Convert to grayscale
    # -----------------------------------------------------

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # -----------------------------------------------------
    # Brightness
    # -----------------------------------------------------

    brightness = float(np.mean(gray))

    if brightness < 45:
        brightness_status = "TOO DARK"
    elif brightness > 215:
        brightness_status = "TOO BRIGHT"
    else:
        brightness_status = "ACCEPTABLE"

    # -----------------------------------------------------
    # Contrast
    # -----------------------------------------------------

    contrast = float(np.std(gray))

    if contrast < 25:
        contrast_status = "LOW"
    else:
        contrast_status = "ACCEPTABLE"

    # -----------------------------------------------------
    # Blur detection
    # -----------------------------------------------------

    blur_score = float(
        cv2.Laplacian(gray, cv2.CV_64F).var()
    )

    if blur_score < 50:
        blur_status = "HIGH BLUR"
    elif blur_score < 120:
        blur_status = "MODERATE BLUR"
    else:
        blur_status = "SHARP"

    # -----------------------------------------------------
    # Overall quality status
    # -----------------------------------------------------

    warnings = []

    if resolution_status == "LOW":
        warnings.append("Low image resolution")

    if brightness_status == "TOO DARK":
        warnings.append("Image is too dark")

    if brightness_status == "TOO BRIGHT":
        warnings.append("Image is too bright")

    if contrast_status == "LOW":
        warnings.append("Low image contrast")

    if blur_status in {"HIGH BLUR", "MODERATE BLUR"}:
        warnings.append("Image may contain blur")

    if not warnings:
        overall_status = "ACCEPTABLE"
    elif len(warnings) == 1:
        overall_status = "ACCEPTABLE WITH WARNING"
    else:
        overall_status = "LOW QUALITY"

    return {
        "width": width,
        "height": height,
        "resolution": resolution,
        "resolution_status": resolution_status,
        "brightness": brightness,
        "brightness_status": brightness_status,
        "contrast": contrast,
        "contrast_status": contrast_status,
        "blur_score": blur_score,
        "blur_status": blur_status,
        "overall_status": overall_status,
        "warnings": warnings,
    }


# ---------------------------------------------------------
# Display report
# ---------------------------------------------------------

def print_quality_report(report):

    print("=" * 60)
    print("IMAGE QUALITY ASSESSMENT")
    print("=" * 60)

    print(
        f"Resolution       : "
        f"{report['width']} x {report['height']}"
    )

    print(
        f"Resolution status: "
        f"{report['resolution_status']}"
    )

    print(
        f"Brightness       : "
        f"{report['brightness']:.2f}"
    )

    print(
        f"Brightness status: "
        f"{report['brightness_status']}"
    )

    print(
        f"Contrast         : "
        f"{report['contrast']:.2f}"
    )

    print(
        f"Contrast status  : "
        f"{report['contrast_status']}"
    )

    print(
        f"Blur score       : "
        f"{report['blur_score']:.2f}"
    )

    print(
        f"Blur status      : "
        f"{report['blur_status']}"
    )

    print(
        f"Overall status   : "
        f"{report['overall_status']}"
    )

    if report["warnings"]:

        print("\nWarnings:")

        for warning in report["warnings"]:
            print(f"  - {warning}")

    else:

        print("\nWarnings: None")


# ---------------------------------------------------------
# Standalone test
# ---------------------------------------------------------

if __name__ == "__main__":

    PROJECT_ROOT = Path(__file__).resolve().parent.parent

    image_dir = (
        PROJECT_ROOT
        / "dataset"
        / "fish_skin_diseases_v6"
        / "valid"
        / "images"
    )

    image_extensions = {
        ".jpg",
        ".jpeg",
        ".png"
    }

    images = [
        path
        for path in image_dir.iterdir()
        if path.suffix.lower() in image_extensions
    ]

    if not images:
        raise FileNotFoundError(
            "No validation images found."
        )

    report = assess_image_quality(images[0])

    print_quality_report(report)