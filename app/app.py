import streamlit as st


# ---------------------------------------------------------
# PAGE CONFIGURATION
# ---------------------------------------------------------

st.set_page_config(
    page_title="Fish Disease Screening",
    page_icon="",
    layout="wide"
)


# ---------------------------------------------------------
# CUSTOM CSS
# ---------------------------------------------------------

st.markdown(
    """
    <style>

    .main {
        background-color: #f7f9fc;
    }

    .title {
        font-size: 32px;
        font-weight: 700;
        color: #14213d;
        margin-bottom: 4px;
    }

    .subtitle {
        font-size: 16px;
        color: #5c677d;
        margin-bottom: 25px;
    }

    .section-title {
        font-size: 20px;
        font-weight: 650;
        color: #14213d;
        margin-top: 20px;
        margin-bottom: 10px;
    }

    .result-card {
        background-color: white;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #dfe4ea;
        min-height: 180px;
    }

    .result-label {
        font-size: 13px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .result-value {
        font-size: 28px;
        font-weight: 700;
        color: #14213d;
        margin-top: 8px;
    }

    .disclaimer {
        margin-top: 30px;
        padding: 14px 18px;
        border-left: 4px solid #14213d;
        background-color: #eef2f7;
        color: #4b5563;
        font-size: 13px;
    }

    </style>
    """,
    unsafe_allow_html=True
)


# ---------------------------------------------------------
# HEADER
# ---------------------------------------------------------

st.markdown(
    '<div class="title">Fish Disease Screening</div>',
    unsafe_allow_html=True
)

st.markdown(
    '<div class="subtitle">'
    'Multi-Model Consensus-Based Image Screening Framework'
    '</div>',
    unsafe_allow_html=True
)


# ---------------------------------------------------------
# INPUT SECTION
# ---------------------------------------------------------

st.markdown(
    '<div class="section-title">Input Image</div>',
    unsafe_allow_html=True
)

uploaded_file = st.file_uploader(
    "Upload a fish image",
    type=["jpg", "jpeg", "png"],
    help="Upload a clear image of a fish for screening."
)


if uploaded_file is not None:

    col1, col2 = st.columns([1, 1])

    with col1:

        st.image(
            uploaded_file,
            caption="Input Image",
            width="stretch"
        )

    with col2:

        st.markdown(
            """
            <div class="result-card">
                <div class="result-label">
                    Screening Status
                </div>

                <div class="result-value">
                    Ready for Analysis
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

        st.write("")

        analyze = st.button(
            "Analyze Image",
            type="primary",
            width="stretch"
        )

        if analyze:

            st.info(
                "Model inference will be connected in the next step."
            )


# ---------------------------------------------------------
# INFORMATION SECTION
# ---------------------------------------------------------

st.markdown(
    '<div class="section-title">System Overview</div>',
    unsafe_allow_html=True
)

overview_col1, overview_col2, overview_col3 = st.columns(3)

with overview_col1:
    st.metric(
        "Models",
        "3",
        help="YOLO11n, YOLO11s and YOLO26n"
    )

with overview_col2:
    st.metric(
        "Consensus",
        "3-Model",
        help="Equal-vote decision-level consensus"
    )

with overview_col3:
    st.metric(
        "Input",
        "Image",
        help="JPG, JPEG or PNG"
    )


# ---------------------------------------------------------
# DISCLAIMER
# ---------------------------------------------------------

st.markdown(
    """
    <div class="disclaimer">
        <strong>Screening only:</strong>
        This system provides image-based AI screening results
        and is not a substitute for expert veterinary diagnosis.
        Results depend on image quality, dataset coverage and
        model performance.
    </div>
    """,
    unsafe_allow_html=True
)