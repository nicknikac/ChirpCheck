$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$py = Join-Path $here ".venv\Scripts\python.exe"

if (-not (Test-Path $py)) {
    Write-Error "Missing $py - create venv first: py -3.12 -m venv .venv && .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt"
    exit 1
}

Set-Location $here
Write-Host "Using: $py"
& $py -c "import sys; print(sys.version)"

# 8001: avoids another app grabbing 8000 (often an old Python 3.13 uvicorn with no TF).
Write-Host "API: http://127.0.0.1:8001/health"
& $py -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
