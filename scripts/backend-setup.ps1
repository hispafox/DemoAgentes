# Installs the backend: Composer (local copy), PHP dependencies and database.
# Usage: .\scripts\backend-setup.ps1
$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root 'backend'
$tools   = Join-Path $root '.tools'
$phar    = Join-Path $tools 'composer.phar'

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    throw 'No se encuentra PHP en el PATH. Instala PHP 8.3 o superior.'
}

# Local Composer: download it and verify its checksum if it is missing.
if (-not (Test-Path $phar)) {
    Write-Host 'Descargando composer.phar...' -ForegroundColor Cyan
    New-Item -ItemType Directory -Force $tools | Out-Null
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest 'https://getcomposer.org/download/latest-stable/composer.phar' -OutFile $phar -UseBasicParsing
    $expected = (Invoke-WebRequest 'https://getcomposer.org/download/latest-stable/composer.phar.sha256' -UseBasicParsing).Content.Trim().Split(' ')[0]
    $actual   = (Get-FileHash $phar -Algorithm SHA256).Hash.ToLower()
    if ($expected -ne $actual) {
        Remove-Item $phar
        throw 'La suma SHA-256 de composer.phar no coincide. Descarga cancelada.'
    }
}

Push-Location $backend
try {
    Write-Host 'Instalando dependencias PHP...' -ForegroundColor Cyan
    & php $phar install --no-interaction
    if ($LASTEXITCODE -ne 0) { throw 'composer install ha fallado.' }

    Write-Host 'Aplicando migraciones (SQLite en var/data.db)...' -ForegroundColor Cyan
    & php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
    if ($LASTEXITCODE -ne 0) { throw 'Las migraciones han fallado.' }

    Write-Host 'Backend listo. Arráncalo con .\scripts\backend-start.ps1' -ForegroundColor Green
}
finally {
    Pop-Location
}
