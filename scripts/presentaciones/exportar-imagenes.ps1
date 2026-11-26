# Exports every slide of a .pptx to PNG through PowerPoint (for visual review).
# Usage: .\scripts\presentaciones\exportar-imagenes.ps1 -Deck <ruta.pptx> -OutDir <carpeta>
param([string]$Deck, [string]$OutDir)
New-Item -ItemType Directory -Force $OutDir | Out-Null
$pp = New-Object -ComObject PowerPoint.Application
$pres = $pp.Presentations.Open($Deck, $true, $false, $false)
$i = 1
foreach ($s in $pres.Slides) { $s.Export((Join-Path $OutDir ("slide-{0:D2}.png" -f $i)), "PNG", 1600, 900); $i++ }
$pres.Close(); $pp.Quit()
"exported $($i-1)"
