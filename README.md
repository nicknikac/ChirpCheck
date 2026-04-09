# ChirpCheck

Web app for identifying bird sounds using BirdNET. The browser records audio and sends it to a FastAPI backend; the backend converts the clip with ffmpeg and runs inference via [birdnetlib](https://github.com/joeweiss/birdnetlib) ([BirdNET](https://birdnet.cornell.edu/)).

- **Frontend:** Next.js, TypeScript, Tailwind  
- **Backend:** FastAPI, TensorFlow Lite (through birdnetlib)

## Requirements

- Node.js 20+
- Python 3.12 (recommended; TensorFlow wheels are unreliable on 3.13 for this stack)
- ffmpeg installed and on `PATH`
- Git

## Setup

```bash
git clone <repository-url>
cd Bird_sound_app

cd frontend && npm install && cd ..

cd backend
py -3.12 -m venv .venv
```

Activate the venv and install Python dependencies:

**Windows (PowerShell):**

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**macOS / Linux:**

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

**Backend** (from `backend/`):

```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

Uses the project venv and serves the API at **http://127.0.0.1:8001**. Check **http://127.0.0.1:8001/health** for `birdnet: true` and the active `python` path.

**Frontend:**

```bash
cd frontend
npm run dev
```

Open **http://localhost:3000**. API URL is set in `.env.local` (default `http://localhost:8001`).

## Contributing

Issues and pull requests are welcome. Useful directions: UX, error handling (ffmpeg, microphone, model load), documentation for other platforms, tests/CI, API behavior (confidence thresholds, multiple top hits).

Describe what changed and why in the PR.

Note: BirdNET model files and licensing are separate from this repo; review the upstream project if you distribute or deploy the model.
