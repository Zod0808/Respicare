<#
.SYNOPSIS
  Bootstrap one-command RespiCare demo (Windows / Docker Desktop).

.DESCRIPTION
  1. Verifica Docker Desktop.
  2. Genera .env con secretos criptograficamente fuertes si no existe o esta incompleto.
  3. docker compose up del stack de desarrollo.
  4. Espera a que backend/AI/web esten healthy.
  5. Corre seed:demo para poblar la BD con 4 doctores, 20 pacientes, admin y ~100 casos.
  6. Imprime URLs y credenciales.

.EXAMPLE
  .\scripts\setup-demo.ps1
  .\scripts\setup-demo.ps1 -SkipSeed
  .\scripts\setup-demo.ps1 -Reset
#>

[CmdletBinding()]
param(
  [switch]$SkipSeed,
  [switch]$Reset
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

function Write-Step($msg) { Write-Host ""; Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    OK  $msg"      -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    !!  $msg"      -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "    XX  $msg"      -ForegroundColor Red }

function New-Secret([int]$bytes) {
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $buf = New-Object byte[] $bytes
  $rng.GetBytes($buf)
  return [Convert]::ToBase64String($buf)
}

# 1. Docker check
Write-Step "Verificando Docker Desktop"
$null = docker info --format '{{.ServerVersion}}' 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Err "Docker Desktop no esta corriendo. Abrilo y volve a ejecutar este script."
  exit 1
}
Write-Ok "Docker responde"

# 2. Ensure .env
Write-Step "Verificando .env"
$envPath = Join-Path $root '.env'

$required = @{
  'NODE_ENV'             = 'development'
  'PORT'                 = '3001'
  'MONGO_USERNAME'       = 'admin'
  'MONGO_PASSWORD'       = { New-Secret 24 }
  'MONGO_DB'             = 'respicare_dev'
  'MONGO_HOST'           = 'mongodb'
  'MONGO_PORT'           = '27017'
  'REDIS_URL'            = 'redis://redis:6379'
  'JWT_SECRET'           = { New-Secret 48 }
  'JWT_REFRESH_SECRET'   = { New-Secret 48 }
  'JWT_EXPIRE'           = '7d'
  'JWT_REFRESH_EXPIRE'   = '30d'
  'BCRYPT_ROUNDS'        = '12'
  'FIELD_ENCRYPTION_KEY' = { New-Secret 32 }
  'AI_SERVICE_URL'       = 'http://ai-services:8000'
  'PUSH_PROVIDER'        = 'none'
  'SMTP_HOST'            = 'mailhog'
  'SMTP_PORT'            = '1025'
  'SMTP_USER'            = 'dev@respicare.local'
  'SMTP_PASSWORD'        = 'dev'
  'EMAIL_FROM'           = 'noreply@respicare.local'
  'REACT_APP_API_URL'    = 'http://localhost:3001/api'
  'REACT_APP_WS_URL'     = 'ws://localhost:3001'
  'CORS_ORIGINS'         = 'http://localhost:3000,http://localhost:8083,capacitor://localhost,https://localhost'
}

$existing = @{}
if (Test-Path $envPath) {
  Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$') {
      $existing[$matches[1]] = $matches[2]
    }
  }
}

$placeholderPattern = 'change_me|changeme|your_|yourpassword|placeholder|xxxx|TODO|CHANGE-ME|change-this|change_this'
$missing = @()
foreach ($k in $required.Keys) {
  $v = $existing[$k]
  $isPlaceholder = $false
  if (-not [string]::IsNullOrWhiteSpace($v)) {
    if ($v -match $placeholderPattern) { $isPlaceholder = $true }
  }
  if ([string]::IsNullOrWhiteSpace($v) -or $isPlaceholder) {
    $default = $required[$k]
    if ($default -is [ScriptBlock]) {
      $existing[$k] = & $default
    } else {
      $existing[$k] = $default
    }
    $missing += $k
  }
}

# Rebuild MONGODB_URI if any of its components changed or if it's missing
$needsUri = $false
if (-not $existing.ContainsKey('MONGODB_URI')) { $needsUri = $true }
if ($missing -contains 'MONGO_USERNAME') { $needsUri = $true }
if ($missing -contains 'MONGO_PASSWORD') { $needsUri = $true }
if ($missing -contains 'MONGO_DB')       { $needsUri = $true }
if ($needsUri) {
  $u = $existing['MONGO_USERNAME']
  $p = $existing['MONGO_PASSWORD']
  $d = $existing['MONGO_DB']
  $existing['MONGODB_URI'] = "mongodb://${u}:${p}@mongodb:27017/${d}?authSource=admin"
  $missing += 'MONGODB_URI'
}

if ($missing.Count -gt 0) {
  Write-Warn "Rellenando/regenerando: $($missing -join ', ')"
  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
  $lines = @("# RespiCare .env - generado por scripts/setup-demo.ps1 el $stamp", '')
  foreach ($k in ($existing.Keys | Sort-Object)) {
    $lines += "$k=$($existing[$k])"
  }
  ($lines -join "`n") | Set-Content -Path $envPath -Encoding utf8 -NoNewline
  Write-Ok ".env actualizado ($($missing.Count) claves)"
} else {
  Write-Ok ".env ya tenia todas las variables requeridas"
}

# 3. Docker compose up
$composeFile = Join-Path $root 'docker-compose.dev.yml'

if ($Reset) {
  Write-Step "Reset: docker compose down -v"
  & docker compose -f $composeFile --env-file $envPath down -v
}

Write-Step "docker compose up -d --build (3-5 min la primera vez)"
& docker compose -f $composeFile --env-file $envPath up -d --build
if ($LASTEXITCODE -ne 0) {
  Write-Err "docker compose up fallo. Revisa: docker compose -f docker-compose.dev.yml logs"
  exit 1
}

# 4. Wait for healthy
Write-Step "Esperando servicios (max 180s)"
$deadline = (Get-Date).AddSeconds(180)
$targets = @(
  @{ Name = 'backend';     Url = 'http://localhost:3001/health'         },
  @{ Name = 'ai-services'; Url = 'http://localhost:8000/api/v1/health'  },
  @{ Name = 'web';         Url = 'http://localhost:3000'                }
)
$ready = @{}
while (((Get-Date) -lt $deadline) -and ($ready.Count -lt $targets.Count)) {
  foreach ($t in $targets) {
    if ($ready.ContainsKey($t.Name)) { continue }
    try {
      $r = Invoke-WebRequest -Uri $t.Url -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
      if ($r.StatusCode -lt 500) {
        $ready[$t.Name] = $true
        Write-Ok "$($t.Name) responde ($($t.Url))"
      }
    } catch {
      # aun no listo
    }
  }
  if ($ready.Count -lt $targets.Count) { Start-Sleep -Seconds 4 }
}
if ($ready.Count -lt $targets.Count) {
  $pending = ($targets | Where-Object { -not $ready.ContainsKey($_.Name) } | ForEach-Object { $_.Name }) -join ', '
  Write-Warn "No respondieron a tiempo: $pending. Puede seguir compilando en background."
}

# 5. Seed demo data
if (-not $SkipSeed) {
  Write-Step "Ejecutando seed:demo dentro del backend"
  & docker compose -f $composeFile --env-file $envPath exec -T backend npm run seed:demo
  if ($LASTEXITCODE -ne 0) {
    Write-Warn "El seed fallo (backend puede seguir arrancando). Reintenta con:"
    Write-Host "  docker compose -f docker-compose.dev.yml exec backend npm run seed:demo" -ForegroundColor Gray
  } else {
    Write-Ok "Seed demo completado"
  }
}

# 6. Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " RespiCare DEMO listo" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host " URLs:" -ForegroundColor White
Write-Host "  Web frontend       : http://localhost:3000"
Write-Host "  Backend API        : http://localhost:3001/api/v1"
Write-Host "  Backend health     : http://localhost:3001/health"
Write-Host "  AI services        : http://localhost:8000/api/v1/health"
Write-Host "  Mongo Express      : http://localhost:8081  (admin / demo1234)"
Write-Host "  Redis Commander    : http://localhost:8082"
Write-Host "  MailHog (SMTP UI)  : http://localhost:8025"
Write-Host ""
Write-Host " Credenciales (todas usan la contrasena: demo1234):" -ForegroundColor White
Write-Host "  Admin    : admin.demo@respicare.com"
Write-Host "  Doctor   : doctor.demo1@respicare.com"
Write-Host "  Paciente : paciente.demo1@respicare.com"
Write-Host ""
Write-Host " Utiles:" -ForegroundColor White
Write-Host "  Ver logs           : docker compose -f docker-compose.dev.yml logs -f [service]"
Write-Host "  Detener            : docker compose -f docker-compose.dev.yml down"
Write-Host "  Reset completo     : .\scripts\setup-demo.ps1 -Reset"
Write-Host ""
