# Checks the backend: container, Doctrine mapping and PHPUnit tests (once installed, issue #2).
# Usage: .\scripts\backend-test.ps1
$ErrorActionPreference = 'Stop'

$backend = Join-Path (Split-Path -Parent $PSScriptRoot) 'backend'
$failed  = $false

function Invoke-Check([string]$name, [scriptblock]$command) {
    Write-Host "== $name" -ForegroundColor Cyan
    & $command
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   FALLO: $name" -ForegroundColor Red
        $script:failed = $true
    }
}

Push-Location $backend
try {
    Invoke-Check 'Contenedor de servicios' { php bin/console lint:container }
    Invoke-Check 'Mapeo de Doctrine'       { php bin/console doctrine:schema:validate --skip-sync }

    if (Test-Path 'bin/phpunit') {
        Invoke-Check 'Tests PHPUnit' { php bin/phpunit }
    }
    else {
        Write-Host '== Tests PHPUnit: todavía no instalados (issue #2)' -ForegroundColor Yellow
    }
}
finally {
    Pop-Location
}

if ($failed) {
    Write-Host 'Hay comprobaciones en rojo.' -ForegroundColor Red
    exit 1
}
Write-Host 'Todo en verde.' -ForegroundColor Green
