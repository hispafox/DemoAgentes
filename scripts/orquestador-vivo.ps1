# Abre la vista en vivo del orquestador: diagrama Mermaid con el estado de cada agente.
# Los hooks de .claude/settings.json escriben scripts/orquestador-vivo/estado.json
# y esta página lo lee cada segundo.
param(
    [int]$Port = 4300
)

$dir = Join-Path $PSScriptRoot 'orquestador-vivo'
$url = "http://127.0.0.1:$Port"

Write-Host "Orquestador en vivo: $url  (Ctrl+C para parar)"
Start-Process $url
node (Join-Path $dir 'servidor.js') $Port
