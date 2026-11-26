# Generates the class decks (.pptx) in docs/presentaciones/ from the presentador's scripts.
# Usage: .\scripts\presentaciones-generar.ps1 [-Solo todas|corta|extendida|bitacora]
param(
    [ValidateSet('todas', 'corta', 'extendida', 'bitacora')]
    [string]$Solo = 'todas'
)
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$gen = Join-Path $PSScriptRoot 'presentaciones'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'No se encuentra Node.js. Instálalo desde https://nodejs.org'
}
# pptxgenjs (MIT) is installed next to the generator, not in the frontend
if (-not (Test-Path (Join-Path $gen 'node_modules\pptxgenjs'))) {
    Push-Location $gen
    try {
        npm install --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'npm install ha fallado.' }
    }
    finally { Pop-Location }
}

function Invoke-Node([string[]]$NodeArgs) {
    & node @NodeArgs
    if ($LASTEXITCODE -ne 0) { throw "Ha fallado: node $($NodeArgs -join ' ')" }
}

Push-Location $root
try {
    $out = 'docs/presentaciones'
    $img = "$out/img"
    if ($Solo -in 'todas', 'corta') {
        Invoke-Node @("$gen/corta.js", "$out/2026-11-26-clase-agentes.pptx")
    }
    if ($Solo -in 'todas', 'extendida') {
        Invoke-Node @("$gen/generar.js", "$out/2026-11-26-clase-agentes-extendida.md", $img, "$out/2026-11-26-clase-agentes-extendida.pptx", "$gen/config/extendida.json")
    }
    if ($Solo -in 'todas', 'bitacora') {
        Invoke-Node @("$gen/generar.js", "$out/2026-11-26-bitacora.md", $img, "$out/2026-11-26-bitacora.pptx", "$gen/config/bitacora.json")
    }
    Write-Host "Presentaciones generadas en $out/" -ForegroundColor Green
}
finally { Pop-Location }
