import io
import re
from pathlib import PurePosixPath

from fastapi import UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from backend.api.errors import ApiError

MAX_UPLOAD_BYTES = 10 * 1024 * 1024   # 10 MB
MAX_PIXELS = 40_000_000               # ~40 MP decompression-bomb guard
MIN_SIDE = 32
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_FORMATS = {"JPEG", "PNG"}

Image.MAX_IMAGE_PIXELS = MAX_PIXELS


def sanitize_filename(raw_name: str | None) -> str:
    """Display-only name. It is never used as a path on disk."""
    name = PurePosixPath((raw_name or "upload").replace("\\", "/")).name
    stem = re.sub(r"[^A-Za-z0-9_-]", "_", PurePosixPath(name).stem)[:60] or "upload"
    return stem + PurePosixPath(name).suffix.lower()


def check_extension(safe_name: str) -> None:
    if PurePosixPath(safe_name).suffix not in ALLOWED_EXTENSIONS:
        raise ApiError(
            "UNSUPPORTED_FORMAT",
            "Unsupported file type. Please upload a JPG, JPEG or PNG image.",
            415,
        )


async def read_limited(upload: UploadFile) -> bytes:
    """Read the upload in chunks and stop as soon as the size limit is exceeded."""
    chunks, total = [], 0
    while chunk := await upload.read(1024 * 1024):
        total += len(chunk)
        if total > MAX_UPLOAD_BYTES:
            raise ApiError(
                "FILE_TOO_LARGE",
                f"Image is larger than the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
                413,
            )
        chunks.append(chunk)
    data = b"".join(chunks)
    if not data:
        raise ApiError("INVALID_IMAGE", "The uploaded file is empty.", 400)
    return data


def decode_image(data: bytes) -> Image.Image:
    """
    Verify the bytes are really a JPEG/PNG, apply EXIF orientation (phone
    photos), and return an RGB image. The caller re-encodes it, so the model
    only ever sees pixels we decoded ourselves, never the raw upload.
    """
    try:
        with Image.open(io.BytesIO(data)) as probe:
            fmt, (w, h) = probe.format, probe.size
        if fmt not in ALLOWED_FORMATS:
            raise ApiError(
                "UNSUPPORTED_FORMAT",
                "Unsupported image content. Please upload a JPG, JPEG or PNG image.",
                415,
            )
        if w * h > MAX_PIXELS:
            raise ApiError("IMAGE_TOO_LARGE", "Image dimensions are too large.", 413)
        if min(w, h) < MIN_SIDE:
            raise ApiError("IMAGE_TOO_SMALL", "Image is too small to analyse.", 400)

        with Image.open(io.BytesIO(data)) as img:
            img.load()
            return ImageOps.exif_transpose(img).convert("RGB")

    except ApiError:
        raise
    except Image.DecompressionBombError:
        raise ApiError("IMAGE_TOO_LARGE", "Image dimensions are too large.", 413)
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError):
        raise ApiError(
            "INVALID_IMAGE",
            "The file could not be read as a valid JPG or PNG image.",
            400,
        )