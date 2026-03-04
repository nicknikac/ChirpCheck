import asyncio
import os
import tempfile

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

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
    """Accept an audio file and return a bird species identification.

    Currently returns mock data. Replace the placeholder section below
    with real BirdNET inference once the model package is installed.
    """
    suffix = os.path.splitext(file.filename or "recording.webm")[1] or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        # ----------------------------------------------------------------
        # BirdNET Integration (placeholder)
        #
        # Install the birdnet package:
        #   pip install birdnet
        #
        # Then replace the mock block below with:
        #
        #   from birdnet import analyze
        #
        #   results = analyze.file(tmp_path)
        #   if results:
        #       top = results[0]
        #       species = top["common_name"]
        #       confidence = top["confidence"]
        #   else:
        #       species = "Unknown"
        #       confidence = 0.0
        #
        # See: https://github.com/birdnet-team/BirdNET-Analyzer
        # ----------------------------------------------------------------

        await asyncio.sleep(2)
        species = "American Robin"
        confidence = 0.85

        return {"species": species, "confidence": confidence}

    finally:
        os.unlink(tmp_path)
