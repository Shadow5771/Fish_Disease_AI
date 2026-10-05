from pathlib import Path

from inference import load_models, run_inference
from consensus import calculate_consensus, format_consensus_summary


# ---------------------------------------------------------
# Project paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

VALIDATION_IMAGE_DIR = (
    PROJECT_ROOT
    / "dataset"
    / "fish_skin_diseases_v6"
    / "valid"
    / "images"
)


# ---------------------------------------------------------
# Find a validation image
# ---------------------------------------------------------

image_extensions = {".jpg", ".jpeg", ".png"}

images = [
    path for path in VALIDATION_IMAGE_DIR.iterdir()
    if path.suffix.lower() in image_extensions
]

if not images:
    raise FileNotFoundError(
        f"No validation images found in: {VALIDATION_IMAGE_DIR}"
    )

image_path = images[0]


# ---------------------------------------------------------
# Load models
# ---------------------------------------------------------

print("=" * 70)
print("FISH DISEASE AI - END-TO-END PIPELINE TEST")
print("=" * 70)

print("\nLoading models...")

models = load_models()

print("\nModels loaded successfully.")


# ---------------------------------------------------------
# Run inference
# ---------------------------------------------------------

print(f"\nTest image:")
print(f"  {image_path.name}")

print("\nRunning all three models...")

inference_results = run_inference(
    models=models,
    image_path=str(image_path),
    confidence=0.25
)


# ---------------------------------------------------------
# Display individual predictions
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("INDIVIDUAL MODEL OUTPUTS")
print("=" * 70)

for model_name, result in inference_results.items():

    print(f"\n{model_name}")

    if not result["detections"]:

        print("  No detection")

        continue

    for detection in result["detections"]:

        print(
            f"  {detection['class_name']} "
            f"({detection['confidence']:.1%})"
        )


# ---------------------------------------------------------
# Calculate consensus
# ---------------------------------------------------------

consensus = calculate_consensus(inference_results)


# ---------------------------------------------------------
# Display final result
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("FINAL CONSENSUS RESULT")
print("=" * 70)

print(format_consensus_summary(consensus))

print("\n" + "=" * 70)
print("PIPELINE TEST COMPLETE")
print("=" * 70)