# YUMENO 一键从零启动（Windows / PowerShell）
#
# 用法：
#   .\scripts\start.ps1              # Web 工作台（默认）：本地 milvus-lite + FastAPI，并打开 Edge
#   .\scripts\start.ps1 -Server      # 同默认（兼容旧参数）
#   .\scripts\start.ps1 -Desktop     # 启动宿主窗口（进度页），工作台仍在浏览器中打开
#   .\scripts\start.ps1 -NoInstall   # 跳过依赖安装（环境已就绪时更快）
#   .\scripts\start.ps1 -NoBrowser   # 不自动打开浏览器
#
# 首次运行会自动：创建 .venv、安装依赖、生成 .env；重复运行直接复用。
# 默认使用嵌入式 milvus-lite，不需要 Docker Desktop。远程 Milvus 通过 .env 配置。

param(
  [switch]$Server,
  [switch]$Desktop,
  [switch]$NoInstall,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host ""
Write-Host "== YUMENO 一键启动 ==" -ForegroundColor Cyan

# ---- 1. 检测 Python 3.11 ----
$pyLauncher = ""
$pyVersionOk = $false
try {
  $out = & py -3.11 -c "import sys; print('%d.%d' % sys.version_info[:2])" 2>$null
  if ($LASTEXITCODE -eq 0 -and $out -match "3\.11") { $pyLauncher = "py"; $pyVersionOk = $true }
} catch {}
if (-not $pyVersionOk) {
  try {
    $out = & python -c "import sys; print('%d.%d' % sys.version_info[:2])" 2>$null
    if ($LASTEXITCODE -eq 0 -and $out -match "3\.11") { $pyLauncher = "python"; $pyVersionOk = $true }
  } catch {}
}
if (-not $pyVersionOk) {
  Write-Host "错误：未检测到 Python 3.11。请先安装 Python 3.11（勾选 Add to PATH），再重新运行。" -ForegroundColor Red
  exit 1
}
Write-Host ("[1/4] Python 3.11 已就绪" + $(if ($pyLauncher -eq "py") { "（py launcher）" } else { "" }))

# ---- 2. 创建虚拟环境并安装依赖 ----
$venvPy = Join-Path $root ".venv\Scripts\python.exe"
$pyArgs = if ($pyLauncher -eq "py") { @("-3.11") } else { @() }
if (-not (Test-Path $venvPy)) {
  Write-Host "[2/4] 创建虚拟环境 .venv ..."
  & $pyLauncher @pyArgs -m venv .venv
  if ($LASTEXITCODE -ne 0) { Write-Host "创建虚拟环境失败" -ForegroundColor Red; exit 1 }
} else {
  Write-Host "[2/4] 虚拟环境已存在"
}

if (-not $NoInstall) {
  $depsOk = & $venvPy -c "import fastapi, uvicorn" 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "     安装依赖（首次，可能需要几分钟）..."
    & $venvPy -m pip install --upgrade pip
    if ($LASTEXITCODE -ne 0) { Write-Host "升级 pip 失败" -ForegroundColor Red; exit 1 }
    & $venvPy -m pip install -e . -r requirements.txt
    if ($LASTEXITCODE -ne 0) { Write-Host "安装依赖失败" -ForegroundColor Red; exit 1 }
  } else {
    Write-Host "     依赖已就绪，跳过安装"
  }
  if ($Desktop) {
    & $venvPy -m pip install -r requirements-desktop.txt
    if ($LASTEXITCODE -ne 0) { Write-Host "安装桌面端依赖失败" -ForegroundColor Red; exit 1 }
  }
} else {
  Write-Host "     已跳过依赖安装（-NoInstall）"
}

# ---- 3. 准备 .env ----
if (-not (Test-Path (Join-Path $root ".env"))) {
  Copy-Item (Join-Path $root ".env.example") (Join-Path $root ".env")
  Write-Host "[3/4] 已生成 .env（默认配置，可稍后在提供商配置页修改）"
} else {
  Write-Host "[3/4] .env 已存在"
}

function Open-YumenoWorkbench {
  if ($NoBrowser) { return }
  & $venvPy -c "from desktop.browser import open_app, app_url, setup_fragment; from settings import Settings; s = Settings.load(); open_app(app_url(port=s.app_port, fragment=setup_fragment(s.openai_api_key, s.openai_base_url)))"
}

function Test-YumenoRunning {
  $code = @'
import httpx
try:
    response = httpx.get("http://127.0.0.1:17000/api/health", timeout=1, trust_env=False)
    raise SystemExit(0 if response.is_success else 1)
except Exception:
    raise SystemExit(1)
'@
  & $venvPy -c $code | Out-Null
  return ($LASTEXITCODE -eq 0)
}

# ---- 4. 启动 ----
if ($Desktop) {
  Write-Host "[4/4] 启动宿主窗口（工作台在浏览器中打开）"
  Write-Host ""
  Write-Host "关闭宿主窗口将停止本地服务。" -ForegroundColor Green
  & $venvPy -B desktop_main.py
  exit $LASTEXITCODE
}

Write-Host "[4/4] 启动 Web 工作台"
if (Test-YumenoRunning) {
  Write-Host "     服务已在 17000 端口运行，正在打开浏览器"
  Open-YumenoWorkbench
  exit 0
}

Write-Host "     使用本地 milvus-lite（无需 Docker）"

if (-not $NoBrowser) {
  Start-Process -WindowStyle Hidden -FilePath $venvPy -ArgumentList @("-B", "-m", "desktop.browser")
}

Write-Host ""
Write-Host "FastAPI 启动中，浏览器访问 http://127.0.0.1:17000/static/index.html （Ctrl+C 停止）" -ForegroundColor Green
& $venvPy -B main.py
