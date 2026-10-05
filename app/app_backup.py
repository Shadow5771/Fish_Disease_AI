from pathlib import Path

import streamlit as st
from PIL import Image
from ultralytics import YOLO


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = Path(
    r"runs\detect\results\training\yolo11n_baseline\weights\best.pt"
)

CLASS_NAMES = [
    "Columnaris Disease",
    "EUS Disease",
    "Gill Disease",
    "Healthy Fish",
    "streptococcus Disease",
]

# Prototype screening levels.
# These are NOT medical/diagnostic thresholds.
HIGH_CONFIDENCE = 0.70
MODERATE_CONFIDENCE = 0.40


# ============================================================
# PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="Fish Disease AI",
    page_icon="🐟",
    layout="wide",
)


# ============================================================
# HEADER
# ============================================================

st.title("Fish Disease AI Screening System")

st.write(
    "Deep Learning-Based Automated Detection and Classification "
    "of Fish Diseases"
)

st.info(
    "AI-based preliminary screening prototype. "
    "The prediction is not a definitive medical or veterinary diagnosis."
)


# ============================================================
# MODEL LOADING
# ============================================================

if not MODEL_PATH.exists():

    st.error(
        "YOLO11 model was not found."
    )

    st.code(str(MODEL_PATH))

    st.stop()


@st.cache_resource
def load_model():
    return YOLO(str(MODEL_PATH))


model = load_model()


# ============================================================
# IMAGE INPUT
# ============================================================

st.subheader("Fish Image")

input_method = st.radio(
    "Choose image source:",
    [
        "Upload Image",
        "Capture with Camera",
    ],
    horizontal=True,
)


image = None


# ------------------------------------------------------------
# UPLOAD IMAGE
# ------------------------------------------------------------

if input_method == "Upload Image":

    uploaded_file = st.file_uploader(
        "Choose a fish image",
        type=["jpg", "jpeg", "png"],
    )

    if uploaded_file is not None:
        image = Image.open(uploaded_file).convert("RGB")


# ------------------------------------------------------------
# CAMERA INPUT
# ------------------------------------------------------------

else:

    st.write(
        "Position the fish clearly in front of the camera "
        "and capture an image."
    )

    camera_image = st.camera_input(
        "Capture Fish Image"
    )

    if camera_image is not None:
        image = Image.open(camera_image).convert("RGB")


# ============================================================
# IMAGE ANALYSIS
# ============================================================

if image is not None:

    st.divider()

    col1, col2 = st.columns(2)

    # --------------------------------------------------------
    # INPUT IMAGE
    # --------------------------------------------------------

    with col1:

        st.subheader("Input Image")

        st.image(
            image,
            use_container_width=True,
        )

        width, height = image.size

        st.caption(
            f"Image resolution: {width} × {height} pixels"
        )

    # --------------------------------------------------------
    # ANALYZE BUTTON
    # --------------------------------------------------------

    with col2:

        st.subheader("Analysis")

        analyze = st.button(
            "Analyze Fish",
            type="primary",
            use_container_width=True,
        )

    # --------------------------------------------------------
    # PREDICTION
    # --------------------------------------------------------

    if analyze:

        with st.spinner(
            "Analyzing fish image using YOLO11..."
        ):

            results = model.predict(
                source=image,
                imgsz=640,
                conf=0.25,
                device=0,
                verbose=False,
            )

        result = results[0]

        # ====================================================
        # NO DETECTION
        # ====================================================

        if (
            result.boxes is None
            or len(result.boxes) == 0
        ):

            st.divider()

            st.subheader("Screening Result")

            st.warning(
                "NO RELIABLE DETECTION"
            )

            st.write(
                "The model did not produce a detection "
                "above the current inference threshold."
            )

            st.caption(
                "This does not mean that the fish is healthy. "
                "The image may be outside the supported conditions "
                "of the current model."
            )

        # ====================================================
        # DETECTIONS AVAILABLE
        # ====================================================

        else:

            detections = []

            # ------------------------------------------------
            # COLLECT DETECTIONS
            # ------------------------------------------------

            for box in result.boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                class_name = model.names[class_id]

                detections.append(
                    {
                        "class_id": class_id,
                        "disease": class_name,
                        "confidence": confidence,
                    }
                )

            # ------------------------------------------------
            # SORT BY CONFIDENCE
            # ------------------------------------------------

            detections.sort(
                key=lambda x: x["confidence"],
                reverse=True,
            )

            primary = detections[0]

            primary_name = primary["disease"]
            primary_confidence = primary["confidence"]

            # =================================================
            # SCREENING LEVEL
            # =================================================

            if primary_confidence >= HIGH_CONFIDENCE:

                screening_level = "HIGHER-CONFIDENCE PREDICTION"

                screening_message = (
                    "The model produced a relatively "
                    "high-confidence prediction."
                )

                screening_type = "success"

            elif primary_confidence >= MODERATE_CONFIDENCE:

                screening_level = "UNCERTAIN"

                screening_message = (
                    "The prediction has moderate confidence "
                    "and should be reviewed."
                )

                screening_type = "warning"

            else:

                screening_level = "LOW-CONFIDENCE PREDICTION"

                screening_message = (
                    "The model confidence is low. "
                    "The result should not be relied upon "
                    "without further verification."
                )

                screening_type = "warning"

            # =================================================
            # PRIMARY RESULT
            # =================================================

            st.divider()

            st.subheader("Primary Detection")

            st.markdown(
                f"### {primary_name}"
            )

            st.metric(
                "Model Confidence",
                f"{primary_confidence:.2%}",
            )

            if screening_type == "success":

                st.success(
                    f"**Screening Level:** "
                    f"{screening_level}\n\n"
                    f"{screening_message}"
                )

            else:

                st.warning(
                    f"**Screening Level:** "
                    f"{screening_level}\n\n"
                    f"{screening_message}"
                )

            # =================================================
            # DETECTION VISUALIZATION
            # =================================================

            st.divider()

            st.subheader(
                "Detection Visualization"
            )

            annotated_image = result.plot()

            st.image(
                annotated_image,
                caption="YOLO11 Detection",
                use_container_width=True,
            )

            # =================================================
            # ALL DETECTIONS
            # =================================================

            st.divider()

            st.subheader(
                "Detection Details"
            )

            for index, detection in enumerate(
                detections
            ):

                disease = detection["disease"]
                confidence = detection["confidence"]

                if index == 0:

                    st.success(
                        f"**Primary:** {disease}  \n"
                        f"Confidence: **{confidence:.2%}**"
                    )

                else:

                    st.info(
                        f"**Secondary:** {disease}  \n"
                        f"Confidence: **{confidence:.2%}**"
                    )

            # =================================================
            # RESEARCH INTERPRETATION
            # =================================================

            st.divider()

            st.subheader(
                "Screening Interpretation"
            )

            st.write(
                f"The highest-confidence model prediction is "
                f"**{primary_name}** with a confidence of "
                f"**{primary_confidence:.2%}**."
            )

            st.write(
                "Model confidence represents the confidence "
                "of the trained object-detection model. "
                "It should not be interpreted as diagnostic certainty."
            )

            # =================================================
            # MULTIPLE DETECTION WARNING
            # =================================================

            if len(detections) > 1:

                st.warning(
                    f"The model produced {len(detections)} "
                    "detections. Multiple detections can occur "
                    "when the image contains several relevant "
                    "regions or when the model is uncertain."
                )


# ============================================================
# CAMERA / INPUT GUIDANCE
# ============================================================

if image is None:

    st.divider()

    st.subheader("Recommended Image Conditions")

    st.markdown(
        """
        - Keep the complete fish visible.
        - Use adequate lighting.
        - Avoid excessive blur.
        - Keep the fish reasonably close to the camera.
        - Avoid heavy obstruction or cropping.
        - Use a clear view of the fish body and affected region.
        """
    )


# ============================================================
# FOOTER
# ============================================================

st.divider()

st.caption(
    "Fish Disease AI | YOLO11 Baseline | "
    "Research Prototype"
)

st.caption(
    "AI-based preliminary screening only. "
    "Predictions require further verification."
)