from pathlib import Path

from inference import load_models, run_inference
from consensus import calculate_consensus
from image_quality import assess_image_quality


class FishDiseaseScreeningPipeline:
    """
    Unified fish disease screening pipeline.

    Pipeline:
        Image
          ↓
        Quality Assessment
          ↓
        Multi-Model Inference
          ↓
        Consensus Analysis
          ↓
        Screening Result
    """

    def __init__(self):

        print("Initializing screening pipeline...")

        self.models = load_models()

        print("Screening pipeline ready.")

    def screen(self, image_path):
        """
        Run the complete screening pipeline on one image.
        """

        image_path = Path(image_path)

        if not image_path.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        # -------------------------------------------------
        # Step 1: Image quality
        # -------------------------------------------------

        quality_report = assess_image_quality(
            image_path
        )

        # -------------------------------------------------
        # Step 2: Multi-model inference
        # -------------------------------------------------

        inference_results = run_inference(
            models=self.models,
            image_path=str(image_path),
            confidence=0.25
        )

        # -------------------------------------------------
        # Step 3: Consensus
        # -------------------------------------------------

        consensus_result = calculate_consensus(
            inference_results
        )

        # -------------------------------------------------
        # Final combined result
        # -------------------------------------------------

        return {
            "image_path": str(image_path),
            "image_quality": quality_report,
            "model_results": inference_results,
            "consensus": consensus_result,
        }


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

    image_path = images[0]

    pipeline = FishDiseaseScreeningPipeline()

    result = pipeline.screen(image_path)

    quality = result["image_quality"]
    consensus = result["consensus"]

    print("\n" + "=" * 70)
    print("FISH DISEASE SCREENING PIPELINE")
    print("=" * 70)

    print(f"\nImage: {image_path.name}")

    print("\nIMAGE QUALITY")
    print(f"  Status: {quality['overall_status']}")
    print(
        f"  Resolution: "
        f"{quality['width']} x {quality['height']}"
    )
    print(
        f"  Brightness: "
        f"{quality['brightness']:.2f}"
    )
    print(
        f"  Contrast: "
        f"{quality['contrast']:.2f}"
    )
    print(
        f"  Blur score: "
        f"{quality['blur_score']:.2f}"
    )

    if quality["warnings"]:

        print("\n  Warnings:")

        for warning in quality["warnings"]:
            print(f"    - {warning}")

    print("\nMODEL PREDICTIONS")

    for model_name, model_result in result[
        "model_results"
    ].items():

        print(f"\n  {model_name}")

        if not model_result["detections"]:

            print("    No detection")

            continue

        for detection in model_result["detections"]:

            print(
                f"    {detection['class_name']} "
                f"({detection['confidence']:.1%})"
            )

    print("\nCONSENSUS")

    if consensus["final_class"]:

        print(
            f"  Result: "
            f"{consensus['final_class']}"
        )

    else:

        print("  Result: No detection")

    print(
        f"  Agreement: "
        f"{consensus['consensus_count']}/"
        f"{consensus['total_models']}"
    )

    print(
        f"  Status: "
        f"{consensus['status']}"
    )

    print(
        f"  Average confidence: "
        f"{consensus['confidence']:.1%}"
    )

    print("\n" + "=" * 70)
    print("SCREENING COMPLETE")
    print("=" * 70)