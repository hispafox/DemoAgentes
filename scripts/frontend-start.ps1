# Starts the Angular dev server on http://localhost:4200, with /api sent to the
# backend through proxy.conf.json. Start the backend first (backend-start.ps1).
# Usage: .\scripts\frontend-start.ps1
$ErrorActionPreference = 'Stop'

$frontend = Join-Path (Split-Path -Parent $PSScriptRoot) 'frontend'

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'No se encuentra npm en el PATH. Instala Node.js 22 LTS o superior.'
}
if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
    throw 'Faltan las dependencias. Ejecuta antes .\scripts\frontend-setup.ps1'
}

Push-Location $frontend
try {
    Write-Host 'Frontend en http://localhost:4200 (Ctrl+C para parar)' -ForegroundColor Green
    & npm start
}
finally {
    Pop-Location
}
