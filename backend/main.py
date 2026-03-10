import os
import subprocess
import tempfile
from datetime import datetime

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer

app = FastAPI(title="ChirpCheck API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    """Accept an audio file and return a bird species identification."""
    suffix = os.path.splitext(file.filename or "recording.webm")[1] or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

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

        subprocess.run(
            ffmpeg_cmd,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

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
