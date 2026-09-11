<#
.SYNOPSIS
  Arranca la app mobile de RespiCare como PWA en el navegador (http://localhost:8083).

.DESCRIPTION
  1. Verifica Node.js.
  2. Instala dependencias en mobile/medical-app si faltan.
  3. Ejecuta `npm run demo` (usa .env.demo -> localhost:3001 / :8000).
  Requiere que setup-demo.ps1 ya haya levantado backend y AI.

.EXAMPLE
  .\scripts\start-mobile-pwa.ps1
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$appDir = Join-Path $root 'mobile\medical-app'

function Write-Step($m) { Write-Host ""; Write-Host "==> $m" -ForegroundColor Cyan }
function Write-Ok($m)   { Write-Host "    OK  $m"      -ForegroundColor Green }
function Write-Err($m)  { Write-Host "    XX  $m"      -ForegroundColor Red }

Write-Step "Verificando Node.js"
$null = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Err "Node.js no esta instalado o no esta en PATH."
  exit 1
}
Write-Ok (node --version)

Write-Step "Verificando dependencias de mobile/medical-app"
$nm = Join-Path $appDir 'node_modules'
if (-not (Test-Path $nm)) {
  Write-Host "    Instalando (puede tardar 2-4 min)..." -ForegroundColor Yellow
  Push-Location $appDir
  try { & npm install --no-audit --no-fund } finally { Pop-Location }
  if ($LASTEXITCODE -ne 0) { Write-Err "npm install fallo"; exit 1 }
}
Write-Ok "node_modules listo"

Write-Step "Verificando .env.demo"
$envDemo = Join-Path $appDir '.env.demo'
if (-not (Test-Path $envDemo)) {
  Write-Err "Falta $envDemo. Recrealo desde .env.example apuntando a localhost."
  exit 1
}
Write-Ok ".env.demo presente"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " Mobile PWA arrancando en http://localhost:8083" -ForegroundColor Green
Write-Host " (Ctrl+C para detener. Backend/AI deben estar en localhost)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Push-Location $appDir
try {
  & npm run demo
} finally {
  Pop-Location
}
