import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import {
  ScanLine,
  History,
  SlidersHorizontal,
  Info,
  ArrowUpRight,
  Activity,
  Camera,
  Upload,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Check,
  AlertTriangle,
  BrainCircuit,
  Layers3,
  FileText,
  X,
  CircleHelp,
} from "lucide-react";

/* =========================================================
   SHARED
========================================================= */

function BottomNavigation() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end>
        <Activity size={18} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/screening">
        <ScanLine size={18} />
        <span>Screen</span>
      </NavLink>

      <NavLink to="/history">
        <History size={18} />
        <span>History</span>
      </NavLink>

      <NavLink to="/extensions">
        <SlidersHorizontal size={18} />
        <span>Extensions</span>
      </NavLink>
    </nav>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Activity size={19} strokeWidth={2.2} />
          </div>

          <div>
            <div className="brand-name">Fish Health AI</div>
            <div className="brand-subtitle">Visual health screening</div>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          System ready
        </div>
      </header>

      <main className="home-content">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">FISH HEALTH SCREENING</span>

            <h1>
              A clearer view of
              <br />
              fish health.
            </h1>

            <p>
              Use an image of a fish to perform a preliminary visual screening
              with our deep-learning models.
            </p>
          </div>

          <div className="screen-card">
            <div className="screen-card-header">
              <div>
                <span className="card-label">NEW SCREENING</span>
                <h2>Check a fish</h2>
              </div>

              <div className="live-indicator">
                <span></span>
                Ready
              </div>
            </div>

            <div className="screen-visual">
              <div className="scan-corner top-left"></div>
              <div className="scan-corner top-right"></div>
              <div className="scan-corner bottom-left"></div>
              <div className="scan-corner bottom-right"></div>

              <div className="scan-center">
                <ScanLine size={34} strokeWidth={1.5} />
                <span>Place a fish image here</span>
              </div>
            </div>

            <div className="screen-actions">
              <NavLink to="/screening" className="primary-action">
                <Camera size={18} />
                Start screening
                <ArrowUpRight size={17} />
              </NavLink>

              <NavLink to="/screening" className="secondary-action">
                <Upload size={17} />
                Upload an image
              </NavLink>
            </div>
          </div>
        </section>

        <section className="overview-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">OVERVIEW</span>
              <h2>Your screening workspace</h2>
            </div>

            <NavLink to="/history" className="text-link">
              View history
              <ChevronRight size={16} />
            </NavLink>
          </div>

          <div className="overview-grid">
            <NavLink to="/history" className="overview-item">
              <div className="overview-icon">
                <History size={19} />
              </div>

              <div className="overview-text">
                <strong>Screening history</strong>
                <span>Review previous observations</span>
              </div>

              <ChevronRight size={17} />
            </NavLink>

            <NavLink to="/extensions" className="overview-item">
              <div className="overview-icon">
                <SlidersHorizontal size={19} />
              </div>

              <div className="overview-text">
                <strong>Environmental extensions</strong>
                <span>Prepare for future sensor data</span>
              </div>

              <ChevronRight size={17} />
            </NavLink>

            <NavLink to="/about" className="overview-item">
              <div className="overview-icon">
                <Info size={19} />
              </div>

              <div className="overview-text">
                <strong>Methodology</strong>
                <span>Understand how screening works</span>
              </div>

              <ChevronRight size={17} />
            </NavLink>
          </div>
        </section>

        <section className="trust-section">
          <div className="trust-line">
            <span className="trust-dot"></span>
            Preliminary screening
          </div>

          <p>
            Results are based on visual patterns learned from the model's
            training data. They do not confirm disease and should be reviewed
            by a qualified veterinarian or aquaculture professional.
          </p>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

/* =========================================================
   SCREENING
========================================================= */

function Screening() {
  const navigate = useNavigate();

  const [stage, setStage] = useState("ready");
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [showModels, setShowModels] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setImage(imageUrl);
    setFileName(file.name);
    setStage("preview");
    setShowModels(false);
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const startCamera = async () => {
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      setCameraError(
        "Camera access was unavailable. You can continue by uploading an image."
      );
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const capturedFile = new File([blob], "fish-camera-capture.jpg", {
        type: "image/jpeg",
      });

      stopCamera();
      handleFile(capturedFile);
    }, "image/jpeg", 0.92);
  };

  const beginAnalysis = () => {
    setStage("quality");

    setTimeout(() => {
      setStage("processing");
    }, 1100);

    setTimeout(() => {
      setStage("result");
    }, 4200);
  };

  const resetScreening = () => {
    setStage("ready");
    setImage(null);
    setFileName("");
    setShowModels(false);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="screening-shell">
      <header className="screening-topbar">
        <button
          className="back-button"
          onClick={() => navigate("/")}
          aria-label="Back to home"
        >
          <ChevronRight size={18} style={{ transform: "rotate(180deg)" }} />
        </button>

        <div>
          <span className="eyebrow">AI SCREENING</span>
          <h1>Screen a fish</h1>
        </div>

        <div className="screening-status">
          <span></span>
          Secure session
        </div>
      </header>

      <main className="screening-content">
        {stage === "ready" && (
          <ReadyState
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            onCamera={startCamera}
          />
        )}

        {stage === "preview" && image && (
          <PreviewState
            image={image}
            fileName={fileName}
            onAnalyze={beginAnalysis}
            onRetake={resetScreening}
          />
        )}

        {stage === "quality" && image && (
          <ProcessingState image={image} stage="quality" />
        )}

        {stage === "processing" && image && (
          <ProcessingState image={image} stage="processing" />
        )}

        {stage === "result" && image && (
          <ResultState
            image={image}
            showModels={showModels}
            setShowModels={setShowModels}
            onReset={resetScreening}
          />
        )}
      </main>

      {cameraOpen && (
        <CameraModal
          videoRef={videoRef}
          onCapture={capturePhoto}
          onClose={stopCamera}
        />
      )}

      {cameraError && (
        <div className="camera-error">
          <AlertTriangle size={17} />
          {cameraError}
          <button onClick={() => setCameraError("")}>
            <X size={15} />
          </button>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}

/* =========================================================
   SCREENING STATES
========================================================= */

function ReadyState({ fileInputRef, onFileChange, onCamera }) {
  return (
    <section className="screening-layout">
      <div className="screening-intro">
        <span className="eyebrow">PREPARE IMAGE</span>

        <h2>
          Start with a clear
          <br />
          view of the fish.
        </h2>

        <p>
          Capture or upload an image where the fish is visible and reasonably
          well lit. The system will check image quality before analysis.
        </p>

        <div className="guidance-list">
          <GuidanceItem
            icon={<ImageIcon size={18} />}
            title="Fish clearly visible"
            text="Keep the fish within the frame."
          />

          <GuidanceItem
            icon={<Sparkles size={18} />}
            title="Good lighting"
            text="Avoid very dark or heavily reflective images."
          />

          <GuidanceItem
            icon={<ScanLine size={18} />}
            title="Useful detail"
            text="Keep the suspected affected region visible."
          />
        </div>
      </div>

      <div className="capture-panel">
        <div className="capture-panel-header">
          <div>
            <span className="card-label">IMAGE INPUT</span>
            <h2>Add a fish image</h2>
          </div>

          <div className="ready-badge">
            <ShieldCheck size={15} />
            Ready
          </div>
        </div>

        <div className="capture-frame">
          <div className="scan-corner top-left"></div>
          <div className="scan-corner top-right"></div>
          <div className="scan-corner bottom-left"></div>
          <div className="scan-corner bottom-right"></div>

          <div className="capture-placeholder">
            <div className="capture-icon">
              <ScanLine size={28} />
            </div>

            <strong>Place a fish image here</strong>
            <span>JPG, JPEG or PNG</span>
          </div>
        </div>

        <div className="capture-actions">
          <button className="primary-action" onClick={onCamera}>
            <Camera size={18} />
            Use camera
            <ArrowUpRight size={17} />
          </button>

          <button
            className="secondary-action"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={17} />
            Upload image
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={onFileChange}
            hidden
          />
        </div>

        <div className="privacy-note">
          <ShieldCheck size={15} />
          Image analysis is performed locally in the prototype.
        </div>
      </div>
    </section>
  );
}

function PreviewState({ image, fileName, onAnalyze, onRetake }) {
  return (
    <section className="analysis-layout">
      <div className="analysis-image-panel">
        <div className="analysis-panel-header">
          <div>
            <span className="eyebrow">IMAGE REVIEW</span>
            <h2>Ready for screening</h2>
          </div>

          <div className="quality-badge">
            <Check size={15} />
            Image received
          </div>
        </div>

        <div className="image-preview-frame">
          <img src={image} alt="Selected fish" />
          <div className="preview-overlay"></div>
        </div>

        <div className="file-information">
          <ImageIcon size={17} />
          <span>{fileName}</span>
        </div>
      </div>

      <div className="analysis-side-panel">
        <span className="eyebrow">NEXT STEP</span>

        <h2>Ready to analyze</h2>

        <p>
          The image will pass through an image-quality check followed by the
          available deep-learning screening models.
        </p>

        <div className="pipeline-preview">
          <PipelineRow
            icon={<ImageIcon size={17} />}
            title="Image quality"
            text="Check visibility and usable detail"
          />

          <PipelineRow
            icon={<BrainCircuit size={17} />}
            title="AI detection"
            text="Analyze visual disease patterns"
          />

          <PipelineRow
            icon={<Layers3 size={17} />}
            title="Model comparison"
            text="Compare available model outputs"
          />

          <PipelineRow
            icon={<ShieldCheck size={17} />}
            title="Reliability"
            text="Assess confidence and agreement"
          />
        </div>

        <button className="large-primary-action" onClick={onAnalyze}>
          <ScanLine size={19} />
          Begin AI screening
          <ArrowUpRight size={18} />
        </button>

        <button className="quiet-action" onClick={onRetake}>
          Choose another image
        </button>
      </div>
    </section>
  );
}

function ProcessingState({ image, stage }) {
  const quality = stage === "quality";

  return (
    <section className="processing-layout">
      <div className="processing-image-wrap">
        <img src={image} alt="Fish being analyzed" />

        <div className="processing-overlay">
          <div className="processing-scan-line"></div>

          <div className="processing-focus">
            <div></div>
          </div>
        </div>
      </div>

      <div className="processing-info">
        <div className="processing-icon">
          {quality ? (
            <ScanLine size={25} />
          ) : (
            <BrainCircuit size={25} />
          )}
        </div>

        <span className="eyebrow">
          {quality ? "IMAGE QUALITY" : "AI ANALYSIS"}
        </span>

        <h2>
          {quality
            ? "Checking image quality."
            : "Analyzing visual patterns."}
        </h2>

        <p>
          {quality
            ? "Making sure the image contains enough usable visual information."
            : "Running the screening pipeline and comparing model predictions."}
        </p>

        <div className="processing-steps">
          <ProcessingStep
            done={!quality}
            active={quality}
            title="Image quality"
          />

          <ProcessingStep
            done={false}
            active={!quality}
            title="Disease detection"
          />

          <ProcessingStep
            done={false}
            active={false}
            title="Model comparison"
          />

          <ProcessingStep
            done={false}
            active={false}
            title="Reliability assessment"
          />
        </div>

        <div className="processing-note">
          <Activity size={16} />
          This may take a few seconds.
        </div>
      </div>
    </section>
  );
}

function ResultState({
  image,
  showModels,
  setShowModels,
  onReset,
}) {
  return (
    <section className="result-layout">
      <div className="result-main">
        <div className="result-heading">
          <div>
            <span className="eyebrow">PRELIMINARY SCREENING</span>
            <h2>EUS Disease</h2>
          </div>

          <div className="result-confidence">
            <strong>86%</strong>
            <span>screening confidence</span>
          </div>
        </div>

        <div className="result-image-frame">
          <img src={image} alt="Analyzed fish" />

          <div className="detection-box">
            <span>EUS region</span>
          </div>

          <div className="result-image-label">
            <ScanLine size={15} />
            AI detection
          </div>
        </div>

        <div className="result-summary">
          <div className="agreement-indicator">
            <div className="agreement-icon">
              <Check size={17} />
            </div>

            <div>
              <strong>3 / 3 models agree</strong>
              <span>All available models selected the same class.</span>
            </div>
          </div>

          <button
            className="model-toggle"
            onClick={() => setShowModels(!showModels)}
          >
            {showModels ? "Hide model analysis" : "View model analysis"}
            <ChevronRight
              size={17}
              style={{
                transform: showModels ? "rotate(90deg)" : "rotate(0deg)",
              }}
            />
          </button>
        </div>

        {showModels && (
          <div className="model-analysis">
            <ModelRow
              name="YOLO11n"
              prediction="EUS Disease"
              confidence="84%"
              status="Agreement"
            />

            <ModelRow
              name="YOLO11s"
              prediction="EUS Disease"
              confidence="88%"
              status="Agreement"
            />

            <ModelRow
              name="YOLO26n"
              prediction="EUS Disease"
              confidence="86%"
              status="Agreement"
            />
          </div>
        )}
      </div>

      <aside className="result-side">
        <div className="result-card explanation-card">
          <div className="result-card-heading">
            <div className="small-icon">
              <Sparkles size={17} />
            </div>

            <div>
              <span className="card-label">EXPLANATION</span>
              <h3>Why this result?</h3>
            </div>
          </div>

          <p>
            The model detected visual characteristics within the highlighted
            region that resemble patterns associated with EUS Disease in its
            training data.
          </p>

          <div className="explanation-list">
            <span>Visual pattern detected</span>
            <span>Region identified</span>
            <span>Model agreement available</span>
          </div>
        </div>

        <div className="result-card guidance-card">
          <div className="result-card-heading">
            <div className="small-icon">
              <ShieldCheck size={17} />
            </div>

            <div>
              <span className="card-label">IMMEDIATE CARE</span>
              <h3>What to check next</h3>
            </div>
          </div>

          <ul>
            <li>Check water quality and environmental conditions.</li>
            <li>Observe other fish for similar visible changes.</li>
            <li>Reduce avoidable stress where possible.</li>
            <li>Seek professional assessment for confirmation.</li>
          </ul>
        </div>

        <div className="result-disclaimer">
          <AlertTriangle size={16} />

          <span>
            This is a preliminary AI screening result. It cannot confirm
            disease or replace professional assessment.
          </span>
        </div>

        <div className="result-actions">
          <button className="large-primary-action">
            <FileText size={18} />
            Generate report
          </button>

          <button className="quiet-action" onClick={onReset}>
            <RefreshCw size={16} />
            Screen another fish
          </button>
        </div>
      </aside>
    </section>
  );
}

/* =========================================================
   SCREENING COMPONENTS
========================================================= */

function GuidanceItem({ icon, title, text }) {
  return (
    <div className="guidance-item">
      <div className="guidance-icon">{icon}</div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

function PipelineRow({ icon, title, text }) {
  return (
    <div className="pipeline-row">
      <div className="pipeline-icon">{icon}</div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

function ProcessingStep({ done, active, title }) {
  return (
    <div className={`processing-step ${active ? "active" : ""}`}>
      <div className={`step-indicator ${done ? "done" : ""}`}>
        {done ? <Check size={13} /> : active ? <span></span> : null}
      </div>

      <span>{title}</span>
    </div>
  );
}

function ModelRow({ name, prediction, confidence, status }) {
  return (
    <div className="model-row">
      <div className="model-name">
        <BrainCircuit size={16} />
        <strong>{name}</strong>
      </div>

      <div className="model-prediction">
        <span>{prediction}</span>
        <small>{status}</small>
      </div>

      <strong className="model-confidence">{confidence}</strong>
    </div>
  );
}

function CameraModal({ videoRef, onCapture, onClose }) {
  return (
    <div className="camera-modal">
      <div className="camera-modal-card">
        <div className="camera-modal-header">
          <div>
            <span className="eyebrow">CAMERA</span>
            <h2>Capture fish image</h2>
          </div>

          <button onClick={onClose} className="close-button">
            <X size={19} />
          </button>
        </div>

        <div className="camera-view">
          <video ref={videoRef} autoPlay playsInline muted />

          <div className="camera-frame-overlay">
            <div className="scan-corner top-left"></div>
            <div className="scan-corner top-right"></div>
            <div className="scan-corner bottom-left"></div>
            <div className="scan-corner bottom-right"></div>
          </div>
        </div>

        <div className="camera-modal-actions">
          <button className="large-primary-action" onClick={onCapture}>
            <Camera size={19} />
            Capture image
          </button>

          <button className="quiet-action" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PLACEHOLDER PAGES
========================================================= */

function HistoryPage() {
  return (
    <div className="page-shell">
      <div className="page-content">
        <span className="eyebrow">HISTORY</span>
        <h1>Screening history</h1>
        <p>
          Previous screening reports will appear here after the report system
          is connected.
        </p>

        <div className="empty-state">
          <History size={24} />
          <strong>No screenings yet</strong>
          <span>Your completed screening reports will appear here.</span>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

function Extensions() {
  return (
    <div className="page-shell">
      <div className="page-content">
        <span className="eyebrow">EXTENSIONS</span>
        <h1>Environmental monitoring</h1>
        <p>
          Temperature, pH, dissolved oxygen and future hardware integrations
          will appear here.
        </p>

        <div className="extension-grid">
          <ExtensionItem title="Temperature" value="Not connected" />
          <ExtensionItem title="pH" value="Not connected" />
          <ExtensionItem title="Dissolved oxygen" value="Not connected" />
          <ExtensionItem title="Future hardware" value="Available later" />
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

function ExtensionItem({ title, value }) {
  return (
    <div className="extension-item">
      <SlidersHorizontal size={19} />
      <div>
        <strong>{title}</strong>
        <span>{value}</span>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="page-shell">
      <div className="page-content">
        <span className="eyebrow">ABOUT</span>
        <h1>How it works</h1>
        <p>
          Fish Health AI uses deep learning for preliminary visual screening of
          fish health conditions.
        </p>

        <div className="methodology-card">
          <div>
            <BrainCircuit size={20} />
            <strong>Deep-learning screening</strong>
          </div>

          <div>
            <Layers3 size={20} />
            <strong>Multi-model comparison</strong>
          </div>

          <div>
            <ShieldCheck size={20} />
            <strong>Reliability-aware results</strong>
          </div>

          <div>
            <CircleHelp size={20} />
            <strong>Professional confirmation recommended</strong>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/screening" element={<Screening />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/extensions" element={<Extensions />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;