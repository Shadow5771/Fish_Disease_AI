import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from backend.api.errors import ApiError  # noqa: E402
from backend.api.routes import router  # noqa: E402
from backend.services.screening_service import ScreeningService  # noqa: E402

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("fish_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.screening = None
    app.state.load_error = None
    try:
        app.state.screening = ScreeningService()
    except Exception as exc:
        log.exception("Model loading failed")
        app.state.load_error = str(exc)
    yield


app = FastAPI(title="Fish Disease AI API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


app.include_router(router)