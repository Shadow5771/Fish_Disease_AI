from pathlib import Path

import cv2


# ---------------------------------------------------------
# Detection visualization
# ---------------------------------------------------------

def draw_detections(image_path, detections):
    """
    Draw YOLO detections on an image.

    Parameters
    ----------
    image_path : str or Path
        Input image.

    detections : list
        Detection dictionaries produced by inference.py.

    Returns
    -------
    image : numpy.ndarray
        Annotated BGR image.
    """

    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError(
            f"Unable to read image: {image_path}"
        )

    for detection in detections:

        x1, y1, x2, y2 = [
            int(value)
            for value in detection["bbox"]
        ]

        class_name = detection["class_name"]
        confidence = detection["confidence"]

        label = (
            f"{class_name} "
            f"{confidence:.1%}"
        )

        # Bounding box
        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            (255, 255, 255),
            2
        )

        # Text background
        (text_width, text_height), baseline = (
            cv2.getTextSize(
                label,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                1
            )
        )

        text_y = max(
            y1,
            text_height + baseline + 5
        )

        cv2.rectangle(
            image,
            (x1, text_y - text_height - baseline - 5),
            (x1 + text_width + 8, text_y),
            (255, 255, 255),
            -1
        )

        # Label
        cv2.putText(
            image,
            label,
            (x1 + 4, text_y - 4),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (0, 0, 0),
            1,
            cv2.LINE_AA
        )

    return image


# ---------------------------------------------------------
# Save visualization
# ---------------------------------------------------------

def save_visualization(
    image_path,
    detections,
    output_path
):
    """
    Create and save an annotated detection image.
    """

    annotated = draw_detections(
        image_path,
        detections
    )

    output_path = Path(output_path)

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    success = cv2.imwrite(
        str(output_path),
        annotated
    )

    if not success:
        raise IOError(
            f"Unable to save visualization: {output_path}"
        )

    return output_path


# ---------------------------------------------------------
# Standalone test
# ---------------------------------------------------------

if __name__ == "__main__":

    from inference import load_models, run_inference

    PROJECT_ROOT = (
        Path(__file__).resolve().parent.parent
    )

    image_dir = (
        PROJECT_ROOT
        / "dataset"
        / "fish_skin_diseases_v6"
        / "valid"
        / "images"
    )

    output_dir = (
        PROJECT_ROOT
        / "results"
        / "visualizations"
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

    image_path = images[0]

    print("=" * 60)
    print("DETECTION VISUALIZATION TEST")
    print("=" * 60)

    print("\nLoading models...")

    models = load_models()

    print("\nRunning inference...")

    results = run_inference(
        models,
        str(image_path),
        confidence=0.25
    )

    print("\nSaving model visualizations...")

    for model_name, model_result in results.items():

        safe_name = model_name.lower()

        output_path = (
            output_dir
            / f"{image_path.stem}_{safe_name}.jpg"
        )

        save_visualization(
            image_path,
            model_result["detections"],
            output_path
        )

        print(
            f"  {model_name} -> "
            f"{output_path}"
        )

    print("\nVisualization test complete.")