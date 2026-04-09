import os
import subprocess
import sys
import tempfile
import traceback
from datetime import datetime

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

try:
    from birdnetlib import Recording
    from birdnetlib.analyzer import Analyzer
except Exception as e:
    Recording = None  # type: ignore[misc, assignment]
    Analyzer = None  # type: ignore[misc, assignment]
    _BIRDNET_IMPORT_ERROR = f"{type(e).__name__}: {e}"
    print("BirdNET import failed:", _BIRDNET_IMPORT_ERROR, file=sys.stderr)
    traceback.print_exc()
else:
    _BIRDNET_IMPORT_ERROR = None

app = FastAPI(title="ChirpCheck API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    ok = _BIRDNET_IMPORT_ERROR is None and Recording is not None and Analyzer is not None
    return {
        "status": "ok",
        "birdnet": ok,
        "python": sys.executable,
        "import_error": _BIRDNET_IMPORT_ERROR or "",
    }


@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    """Accept an audio file and return a bird species identification."""
    if _BIRDNET_IMPORT_ERROR is not None or Recording is None or Analyzer is None:
        raise HTTPException(
            status_code=503,
            detail=_BIRDNET_IMPORT_ERROR or "BirdNET did not import; check backend Python and pip install.",
        )

    suffix = os.path.splitext(file.filename or "recording.webm")[1] or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    wav_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as wav_tmp:
            wav_path = wav_tmp.name

        ffmpeg_cmd = [
            "ffmpeg",
            "-y",
            "-i",
            tmp_path,
            "-ar",
            "48000",
            "-ac",
            "1",
            wav_path,
        ]

        try:
            subprocess.run(
                ffmpeg_cmd,
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            raise HTTPException(
                status_code=500,
                detail=f"ffmpeg failed (is it on PATH?): {e.stderr[-500:] if e.stderr else e}",
            ) from e

        analyzer = Analyzer()
        recording = Recording(
            analyzer,
            wav_path,
            lat=0.0,
            lon=0.0,
            date=datetime.utcnow(),
            min_conf=0.25,
        )
        recording.analyze()

        if recording.detections:
            top = max(
                recording.detections,
                key=lambda d: d.get("confidence", 0.0),
            )
            species = top.get("common_name", "Unknown")
            confidence = float(top.get("confidence", 0.0))
        else:
            species = "Unknown"
            confidence = 0.0

        return {"species": species, "confidence": confidence}
    finally:
        os.unlink(tmp_path)
        if wav_path:
            try:
                os.unlink(wav_path)
            except OSError:
                pass
