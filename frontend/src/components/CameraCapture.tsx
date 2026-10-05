import { useEffect, useRef, useState } from "react";

interface Props {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported by this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraReady(true);
      } catch (error) {
        if (!mounted) return;

        if (error instanceof DOMException) {
          if (error.name === "NotAllowedError") {
            setCameraError(
              "Camera permission was denied. Allow camera access and try again.",
            );
          } else if (error.name === "NotFoundError") {
            setCameraError("No camera was found on this device.");
          } else if (error.name === "NotReadableError") {
            setCameraError(
              "The camera is currently being used by another application.",
            );
          } else {
            setCameraError("Unable to access the camera.");
          }
        } else {
          setCameraError("Unable to access the camera.");
        }
      }
    }

    void startCamera();

    return () => {
      mounted = false;

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  function captureImage() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !cameraReady) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError("Camera frame is not ready yet. Please try again.");
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Unable to capture the camera frame.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Unable to create the captured image.");
          return;
        }

        const file = new File(
          [blob],
          `fish-camera-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          },
        );

        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
        }

        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;

        setCapturedFile(file);
        setCapturedUrl(url);
        setCameraError(null);
      },
      "image/jpeg",
      0.92,
    );
  }

  function retake() {
    setCapturedFile(null);
    setCapturedUrl(null);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  function useCapturedImage() {
    if (!capturedFile) return;

    onCapture(capturedFile);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Camera capture"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="card w-full max-w-2xl overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="eyebrow">Image acquisition</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-snow">
              Camera capture
            </h2>
          </div>

          <button
            type="button"
            className="btn btn-secondary px-3 py-2"
            onClick={onClose}
            aria-label="Close camera"
          >
            Close
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {capturedUrl ? (
            <div>
              <div className="overflow-hidden rounded-xl border border-line bg-black">
                <img
                  src={capturedUrl}
                  alt="Captured fish image preview"
                  className="max-h-[60vh] w-full object-contain"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={useCapturedImage}
                >
                  Use captured image
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={retake}
                >
                  Retake
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative overflow-hidden rounded-xl border border-line bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="aspect-video w-full object-cover"
                  aria-label="Live camera preview"
                />

                {!cameraReady && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink-950/70">
                    <p className="text-sm text-mist">
                      Starting camera…
                    </p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {cameraError && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-200"
                >
                  {cameraError}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!cameraReady}
                  onClick={captureImage}
                >
                  Capture image
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-mist">
                Capture a clear image of the fish. The image will be reviewed
                before it is sent for screening.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}