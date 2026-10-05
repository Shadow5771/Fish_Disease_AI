import streamlit as st
from pathlib import Path
from PIL import Image
from ultralytics import YOLO


# ============================================================
# CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="AI Screening | Fish Health",
    page_icon="🐟",
    layout="wide",
    initial_sidebar_state="expanded",
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "runs"
    / "detect"
    / "results"
    / "training"
    / "yolo11n_baseline"
    / "weights"
    / "best.pt"
)

CLASS_NAMES = [
    "Columnaris Disease",
    "EUS Disease",
    "Gill Disease",
    "Healthy Fish",
    "streptococcus Disease",
]

DETECTION_CONFIDENCE = 0.25

HIGH_CONFIDENCE = 0.70
MODERATE_CONFIDENCE = 0.40


# ============================================================
# STYLING
# ============================================================

st.markdown(
    """
    <style>
        .main-title {
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 0.2rem;
        }

        .subtitle {
            color: #64748b;
            font-size: 1rem;
            margin-bottom: 1.5rem;
        }

        .result-card {
            padding: 1.2rem;
            border-radius: 14px;
            border: 1px solid rgba(128,128,128,0.20);
            margin-top: 1rem;
        }

        .metric-card {
            padding: 1rem;
            border-radius: 12px;
            border: 1px solid rgba(128,128,128,0.18);
            text-align: center;
        }

        .small-note {
            color: #64748b;
            font-size: 0.85rem;
        }

        .disclaimer {
            padding: 1rem;
            border-left: 4px solid #64748b;
            background: rgba(100,116,139,0.08);
            border-radius: 8px;
            margin-top: 1.5rem;
        }
    </style>
    """,
    unsafe_allow_html=True,
)


# ============================================================
# MODEL
# ============================================================

@st.cache_resource
def load_model():
    if not MODEL_PATH.exists():
        st.error(f"Model not found:\n{MODEL_PATH}")
        st.stop()

    return YOLO(str(MODEL_PATH))


model = load_model()


# ============================================================
# HEADER
# ============================================================

st.markdown(
    '<div class="main-title">AI Fish Health Screening</div>',
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="subtitle">
        Upload or capture a fish image for preliminary AI-based disease screening.
    </div>
    """,
    unsafe_allow_html=True,
)


# ============================================================
# INPUT
# ============================================================

input_method = st.radio(
    "Choose image source",
    ["Upload Image", "Camera"],
    horizontal=True,
)

uploaded_file = None

if input_method == "Upload Image":
    uploaded_file = st.file_uploader(
        "Upload a fish image",
        type=["jpg", "jpeg", "png"],
        help="Use a clear image where the fish and affected region are visible.",
    )

else:
    uploaded_file = st.camera_input(
        "Capture a fish image",
    )


# ============================================================
# PROCESS IMAGE
# ============================================================

if uploaded_file is not None:

    image = Image.open(uploaded_file).convert("RGB")

    st.markdown("### Image Preview")
    st.image(image, width="stretch")

    if st.button(
        "Run AI Screening",
        type="primary",
        use_container_width=True,
    ):

        with st.status("Analyzing fish image...", expanded=True) as status:

            st.write("Loading image...")
            st.write("Running YOLO11 detection...")
            
            results = model.predict(
                source=image,
                imgsz=640,
                conf=DETECTION_CONFIDENCE,
                device=0,
                verbose=False,
            )

            result = results[0]

            status.update(
                label="Analysis complete",
                state="complete",
                expanded=False,
            )

        # ----------------------------------------------------
        # NO DETECTIONS
        # ----------------------------------------------------

        if result.boxes is None or len(result.boxes) == 0:

            st.warning(
                "No confident disease-related detection was found in this image."
            )

            st.info(
                "Try a clearer image with the fish fully visible and the affected "
                "region clearly captured."
            )

        else:

            # ------------------------------------------------
            # EXTRACT DETECTIONS
            # ------------------------------------------------

            boxes = result.boxes

            confidences = boxes.conf.cpu().tolist()
            class_ids = boxes.cls.cpu().tolist()

            detections = []

            for class_id, confidence in zip(class_ids, confidences):

                class_id = int(class_id)
                confidence = float(confidence)

                detections.append(
                    {
                        "class": CLASS_NAMES[class_id],
                        "confidence": confidence,
                    }
                )

            detections.sort(
                key=lambda x: x["confidence"],
                reverse=True,
            )

            primary = detections[0]

            disease_name = primary["class"]
            confidence = primary["confidence"]

            # ------------------------------------------------
            # RELIABILITY LEVEL
            # ------------------------------------------------

            if confidence >= HIGH_CONFIDENCE:
                reliability = "Higher-confidence screening result"

            elif confidence >= MODERATE_CONFIDENCE:
                reliability = "Moderate-confidence screening result"

            else:
                reliability = "Low-confidence screening result"

            # ------------------------------------------------
            # RESULT
            # ------------------------------------------------

            st.markdown("## Screening Result")

            col1, col2, col3 = st.columns(3)

            with col1:
                st.markdown(
                    '<div class="metric-card">'
                    '<b>Detected Pattern</b><br>'
                    f'{disease_name}'
                    '</div>',
                    unsafe_allow_html=True,
                )

            with col2:
                st.markdown(
                    '<div class="metric-card">'
                    '<b>Confidence</b><br>'
                    f'{confidence * 100:.1f}%'
                    '</div>',
                    unsafe_allow_html=True,
                )

            with col3:
                st.markdown(
                    '<div class="metric-card">'
                    '<b>Reliability</b><br>'
                    f'{reliability}'
                    '</div>',
                    unsafe_allow_html=True,
                )

            # ------------------------------------------------
            # ANNOTATED IMAGE
            # ------------------------------------------------

            st.markdown("### Detection Visualization")

            annotated = result.plot()

            st.image(
                annotated,
                width="stretch",
            )

            # ------------------------------------------------
            # WHY THE AI GAVE THIS RESULT
            # ------------------------------------------------

            st.markdown("### Why did the AI give this result?")

            st.write(
                f"The model detected visual characteristics within the "
                f"highlighted region that resemble patterns associated with "
                f"**{disease_name}** in its training data."
            )

            st.write(
                "The highlighted bounding box shows the region that contributed "
                "to the model's detection."
            )

            # ------------------------------------------------
            # IMMEDIATE CARE
            # ------------------------------------------------

            st.markdown("### Immediate Care Guidance")

            st.write(
                "This result should be treated as a preliminary screening signal, "
                "not a confirmed diagnosis."
            )

            st.write(
                "Recommended immediate actions:"
            )

            st.markdown(
                """
                - Reduce unnecessary handling and stress on the fish.
                - Check water quality and environmental conditions.
                - Observe other fish for similar visible symptoms.
                - If multiple fish are affected, consider separating visibly "
                  "affected fish where practical.
                - Seek assessment from an aquaculture professional or veterinarian.
                """
            )

            # ------------------------------------------------
            # MULTIPLE DETECTIONS
            # ------------------------------------------------

            if len(detections) > 1:

                st.markdown("### Other Detected Patterns")

                for detection in detections[1:]:

                    st.write(
                        f"**{detection['class']}** — "
                        f"{detection['confidence'] * 100:.1f}%"
                    )

            # ------------------------------------------------
            # DISCLAIMER
            # ------------------------------------------------

            st.markdown(
                """
                <div class="disclaimer">
                    <b>Important:</b> This AI system provides preliminary visual
                    screening only. It cannot confirm a disease or replace
                    examination by a qualified veterinarian or aquaculture
                    professional. Model confidence is not equivalent to clinical
                    certainty.
                </div>
                """,
                unsafe_allow_html=True,
            )


# ============================================================
# FOOTER
# ============================================================

st.markdown("---")

st.markdown(
    """
    <div class="small-note">
        Fish Disease AI Screening Prototype • YOLO11 baseline
    </div>
    """,
    unsafe_allow_html=True,
)