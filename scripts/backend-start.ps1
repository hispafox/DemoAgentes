# Starts the backend with the Symfony CLI local server.
# Usage: .\scripts\backend-start.ps1 [-Port 8000] [-Foreground]
param(
    [int]$Port = 8000,
    [switch]$Foreground
)
$ErrorActionPreference = 'Stop'

$backend = Join-Path (Split-Path -Parent $PSScriptRoot) 'backend'

if (-not (Get-Command symfony -ErrorAction SilentlyContinue)) {
    throw 'No se encuentra la Symfony CLI. Instálala desde https://symfony.com/download'
}
if (-not (Test-Path (Join-Path $backend 'vendor'))) {
    throw 'Faltan las dependencias. Ejecuta antes .\scripts\backend-setup.ps1'
}

Push-Location $backend
try {
    if ($Foreground) {
        Write-Host "Backend en http://127.0.0.1:$Port (Ctrl+C para parar)" -ForegroundColor Green
        & symfony server:start --no-tls --port=$Port
    }
    else {
        & symfony server:start --no-tls --port=$Port -d
        if ($LASTEXITCODE -ne 0) { throw 'No se ha podido arrancar el servidor.' }
        Write-Host "Backend en http://127.0.0.1:$Port . Páralo con .\scripts\backend-stop.ps1" -ForegroundColor Green
    }
}
finally {
    Pop-Location
}
