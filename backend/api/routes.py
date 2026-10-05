import logging
import tempfile
import uuid
from pathlib import Path

import torch
from fastapi import APIRouter, File, Request, UploadFile
from starlette.concurrency import run_in_threadpool

from backend.api.errors import ApiError
from backend.services.screening_service import (
    CONFIDENCE_THRESHOLD,
    PROJECT_ROOT,
    ScreeningService,
)
from backend.services.upload_validation import (
    check_extension,
    decode_image,
    read_limited,
    sanitize_filename,
)
from inference import CLASS_NAMES, MODEL_PATHS

log = logging.getLogger("fish_api")
router = APIRouter(prefix="/api")


def _screen_image(service: ScreeningService, image, display_name: str) -> dict:
    # Fresh server-generated filename in a private temp dir; deleted on exit.
    with tempfile.TemporaryDirectory(prefix="fish_screen_") as tmp:
        path = Path(tmp) / f"{uuid.uuid4().hex}.png"
        image.save(path, format="PNG", compress_level=1)
        return service.screen(path, display_name)


@router.get("/health")
def health(request: Request):
    service = request.app.state.screening
    cuda = torch.cuda.is_available()
    return {
        "status": "ok" if service is not None else "degraded",
        "models_loaded": service is not None,
        "load_error": request.app.state.load_error,
        "weights_found": {name: path.exists() for name, path in MODEL_PATHS.items()},
        "cuda_available": cuda,
        "gpu": torch.cuda.get_device_name(0) if cuda else None,
    }


@router.get("/models")
def models(request: Request):
    loaded = request.app.state.screening is not None
    return {
        "classes": CLASS_NAMES,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "models": [
            {
                "name": name,
                "weights": path.relative_to(PROJECT_ROOT).as_posix(),
                "weights_found": path.exists(),
                "size_mb": round(path.stat().st_size / 1e6, 2) if path.exists() else None,
                "loaded": loaded,
            }
            for name, path in MODEL_PATHS.items()
        ],
    }


@router.post("/screen")
async def screen(request: Request, file: UploadFile = File(...)):
    service = request.app.state.screening
    if service is None:
        raise ApiError(
            "MODEL_LOAD_ERROR",
            "The screening models are not available. Check the backend logs.",
            503,
        )

    display_name = sanitize_filename(file.filename)
    check_extension(display_name)
    data = await read_limited(file)
    image = decode_image(data)

    try:
        return await run_in_threadpool(_screen_image, service, image, display_name)
    except Exception:
        log.exception("Screening failed")
        raise ApiError(
            "INFERENCE_FAILED",
            "Screening could not be completed for this image.",
            500,
        )