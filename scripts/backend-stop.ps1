# Stops the backend local server started with backend-start.ps1.
# Usage: .\scripts\backend-stop.ps1
$ErrorActionPreference = 'Stop'

$backend = Join-Path (Split-Path -Parent $PSScriptRoot) 'backend'

Push-Location $backend
try {
    & symfony server:stop
}
finally {
    Pop-Location
}
