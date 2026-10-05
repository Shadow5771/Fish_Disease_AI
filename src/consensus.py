from collections import Counter


MODEL_NAMES = [
    "YOLO11n",
    "YOLO11s",
    "YOLO26n"
]


def get_primary_prediction(model_result):
    """
    Select the highest-confidence detection from a model.
    """

    detections = model_result.get("detections", [])

    if not detections:
        return None

    return max(
        detections,
        key=lambda detection: detection["confidence"]
    )


def calculate_consensus(inference_results):
    """
    Calculate transparent multi-model consensus.

    Each model contributes one equal vote based on its
    highest-confidence detection.

    Confidence is reported separately from agreement.
    """

    predictions = {}

    # -----------------------------------------------------
    # Collect model predictions
    # -----------------------------------------------------

    for model_name in MODEL_NAMES:

        model_result = inference_results.get(
            model_name,
            {"detections": []}
        )

        prediction = get_primary_prediction(
            model_result
        )

        if prediction is not None:
            predictions[model_name] = prediction

    total_models = len(MODEL_NAMES)
    detected_models = len(predictions)

    # -----------------------------------------------------
    # No detection
    # -----------------------------------------------------

    if detected_models == 0:

        return {
            "final_class": None,
            "consensus_count": 0,
            "detected_models": 0,
            "total_models": total_models,
            "status": "NO DETECTION",
            "average_confidence": 0.0,
            "min_confidence": 0.0,
            "max_confidence": 0.0,
            "confidence_range": 0.0,
            "model_predictions": predictions
        }

    # -----------------------------------------------------
    # Count votes
    # -----------------------------------------------------

    class_votes = Counter(
        prediction["class_name"]
        for prediction in predictions.values()
    )

    final_class, vote_count = (
        class_votes.most_common(1)[0]
    )

    # -----------------------------------------------------
    # Consensus status
    # -----------------------------------------------------

    if vote_count == total_models:

        status = "CONSENSUS"

    elif vote_count >= 2:

        status = "PARTIAL CONSENSUS"

    else:

        status = "NO CONSENSUS"

    # -----------------------------------------------------
    # Confidence statistics for selected class
    # -----------------------------------------------------

    selected_confidences = [
        prediction["confidence"]
        for prediction in predictions.values()
        if prediction["class_name"] == final_class
    ]

    average_confidence = (
        sum(selected_confidences)
        / len(selected_confidences)
    )

    min_confidence = min(selected_confidences)
    max_confidence = max(selected_confidences)

    confidence_range = (
        max_confidence - min_confidence
    )

    # -----------------------------------------------------
    # Interpretation note
    # -----------------------------------------------------

    if status == "CONSENSUS":

        decision_note = (
            "All evaluated models agree on the "
            "screening class."
        )

    elif status == "PARTIAL CONSENSUS":

        decision_note = (
            "Majority agreement exists, but at least "
            "one model disagrees."
        )

    else:

        decision_note = (
            "Models disagree. The result should be "
            "reviewed rather than treated as a "
            "consensus screening result."
        )

    return {
        "final_class": final_class,
        "consensus_count": vote_count,
        "detected_models": detected_models,
        "total_models": total_models,
        "status": status,
        "average_confidence": average_confidence,
        "min_confidence": min_confidence,
        "max_confidence": max_confidence,
        "confidence_range": confidence_range,
        "decision_note": decision_note,
        "model_predictions": predictions
    }


def format_consensus_summary(consensus):
    """
    Create a human-readable consensus summary.
    """

    if consensus["status"] == "NO DETECTION":

        return (
            "No detection was produced by the "
            "evaluated models."
        )

    return (
        f"Result: {consensus['final_class']}\n"
        f"Agreement: "
        f"{consensus['consensus_count']}/"
        f"{consensus['total_models']}\n"
        f"Status: {consensus['status']}\n"
        f"Average model confidence: "
        f"{consensus['average_confidence']:.1%}\n"
        f"Confidence range: "
        f"{consensus['min_confidence']:.1%} - "
        f"{consensus['max_confidence']:.1%}\n"
        f"Decision note: "
        f"{consensus['decision_note']}"
    )


# ---------------------------------------------------------
# Standalone test
# ---------------------------------------------------------

if __name__ == "__main__":

    test_results = {

        "YOLO11n": {
            "detections": [{
                "class_id": 1,
                "class_name": "EUS Disease",
                "confidence": 0.72,
                "bbox": [10, 20, 100, 150]
            }]
        },

        "YOLO11s": {
            "detections": [{
                "class_id": 1,
                "class_name": "EUS Disease",
                "confidence": 0.76,
                "bbox": [12, 21, 101, 151]
            }]
        },

        "YOLO26n": {
            "detections": [{
                "class_id": 1,
                "class_name": "EUS Disease",
                "confidence": 0.89,
                "bbox": [11, 19, 99, 149]
            }]
        }
    }

    consensus = calculate_consensus(
        test_results
    )

    print("=" * 60)
    print("MULTI-MODEL CONSENSUS TEST")
    print("=" * 60)

    print(
        format_consensus_summary(consensus)
    )

    print("\nIndividual predictions:")

    for model_name, prediction in (
        consensus["model_predictions"].items()
    ):

        print(
            f"  {model_name}: "
            f"{prediction['class_name']} "
            f"({prediction['confidence']:.1%})"
        )