$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm was not found. Install Node.js 20 or newer before building YUMENO."
}
Write-Host "Building Vue frontend..."
Push-Location (Join-Path $projectRoot "frontend")
try {
  & npm ci
  if ($LASTEXITCODE -ne 0) { throw "Failed to install Vue frontend dependencies." }
  & npm run build:frontend
  if ($LASTEXITCODE -ne 0) { throw "Failed to build the Vue frontend." }
} finally {
  Pop-Location
}

& .\.venv\Scripts\python.exe -m pip install -r requirements-desktop.txt
& .\.venv\Scripts\python.exe -m PyInstaller `
  --noconfirm `
  --clean `
  --windowed `
  --onedir `
  --contents-directory "." `
  --name YUMENO `
  --collect-all webview `
  --exclude-module speech_recognition `
  --exclude-module tensorboard `
  --exclude-module pytest `
  --exclude-module matplotlib `
  --exclude-module azure-ai-contentunderstanding `
  --exclude-module azure-ai-documentintelligence `
  --exclude-module azure-identity `
  --exclude-module youtube-transcript-api `
  --add-data "static;static" `
  --add-data "resources;resources" `
  --add-data "docker-compose.yml;." `
  --add-data ".env.example;." `
  desktop_main.py

Write-Host "Built:" (Join-Path $projectRoot "dist\YUMENO\YUMENO.exe")

# Build the optional Inno Setup installer.
$isccCandidates = @(
  (Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 7\ISCC.exe"),
  (Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe"),
  (Join-Path ${env:ProgramFiles(x86)} "Inno Setup 7\ISCC.exe"),
  (Join-Path ${env:ProgramFiles(x86)} "Inno Setup 6\ISCC.exe")
)
$iscc = $isccCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $iscc) {
  Write-Warning "Inno Setup was not found; skipping installer generation. Install it from https://jrsoftware.org/isdl.php and retry."
} else {
  Write-Host "Building Inno Setup installer..."
  & $iscc (Join-Path $projectRoot "scripts\YUMENO.iss")
  if ($LASTEXITCODE -ne 0) { throw "Inno Setup compilation failed." }
  Write-Host "Installer:" (Join-Path $projectRoot "dist\YUMENO-Setup-0.2.0.exe")
}
