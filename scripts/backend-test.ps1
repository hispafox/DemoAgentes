# Checks the backend like the CI does (#4): container, Doctrine mapping,
# code style (PHP-CS-Fixer), static analysis (PHPStan) and PHPUnit tests.
# Usage: .\scripts\backend-test.ps1 [-SkipPhpUnit]
param(
    [switch]$SkipPhpUnit
)
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
    Invoke-Check 'Estilo (PHP-CS-Fixer)'   { php vendor/bin/php-cs-fixer fix --dry-run --diff }
    Invoke-Check 'PHPStan (nivel 6)'       { php vendor/bin/phpstan analyse --no-progress --memory-limit=1G }

    if ($SkipPhpUnit) {
        Write-Host '== Tests PHPUnit: omitidos (-SkipPhpUnit)' -ForegroundColor Yellow
    }
    elseif (Test-Path 'bin/phpunit') {
        Invoke-Check 'Tests PHPUnit' { php bin/phpunit }
    }
    else {
        Write-Host '== Tests PHPUnit: no instalados' -ForegroundColor Yellow
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
