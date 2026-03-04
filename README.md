# ChirpCheck

ChirpCheck is an app for identifying birds by their sounds using BirdNET.

It records audio from the browser and sends it to a FastAPI backend. The backend accepts an audio file and returns a simple JSON response with a species name and confidence score. Right now the response is mocked, I still have to add the BirdNET model later.

## Requirements

- Node.js 20+
- Python 3.11+ with `pip`

## Setup

Clone the repository and install dependencies for both parts of the app.

```bash
cd Bird_sound_app

cd frontend
npm install

cd ../backend
pip install -r requirements.txt
```

## Running the app

Start the backend first:

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

Then start the frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser. Press “Record Birdsongs” to capture a short clip and wait for the identification result.

