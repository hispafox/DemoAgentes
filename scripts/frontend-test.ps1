# Checks the frontend: Vitest tests (one run) and production build.
# Usage: .\scripts\frontend-test.ps1
$ErrorActionPreference = 'Stop'

$frontend = Join-Path (Split-Path -Parent $PSScriptRoot) 'frontend'
$failed   = $false

function Invoke-Check([string]$name, [scriptblock]$command) {
    Write-Host "== $name" -ForegroundColor Cyan
    & $command
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   FALLO: $name" -ForegroundColor Red
        $script:failed = $true
    }
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'No se encuentra npm en el PATH. Instala Node.js 22 LTS o superior.'
}

Push-Location $frontend
try {
    Invoke-Check 'Tests (Vitest)' { npm test }
    Invoke-Check 'Build'          { npm run build }
}
finally {
    Pop-Location
}

if ($failed) {
    Write-Host 'Hay comprobaciones en rojo.' -ForegroundColor Red
    exit 1
}
Write-Host 'Todo en verde.' -ForegroundColor Green
