# Installs the frontend dependencies (Angular).
# Usage: .\scripts\frontend-setup.ps1
$ErrorActionPreference = 'Stop'

$frontend = Join-Path (Split-Path -Parent $PSScriptRoot) 'frontend'

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'No se encuentra npm en el PATH. Instala Node.js 22 LTS o superior.'
}

Push-Location $frontend
try {
    Write-Host 'Instalando dependencias de npm...' -ForegroundColor Cyan
    & npm install
    if ($LASTEXITCODE -ne 0) { throw 'npm install ha fallado.' }

    Write-Host 'Frontend listo. Arráncalo con .\scripts\frontend-start.ps1' -ForegroundColor Green
}
finally {
    Pop-Location
}
