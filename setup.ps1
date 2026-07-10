# Project RA Relocation Setup for PowerShell
Write-Host "--- Project RA Relocation Setup (PowerShell) ---" -ForegroundColor Yellow

$TargetDir = Join-Path $PSScriptRoot "public/invitation"

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    Write-Host "[✔] Created directory: public/invitation" -ForegroundColor Green
} else {
    Write-Host "[i] Directory public/invitation already exists." -ForegroundColor Cyan
}

$ItemsToMove = @(
    @{ src = "index.html"; dest = "public/invitation/index.html" },
    @{ src = "style.css"; dest = "public/invitation/style.css" },
    @{ src = "script.js"; dest = "public/invitation/script.js" },
    @{ src = "assets"; dest = "public/invitation/assets" },
    @{ src = "data"; dest = "public/invitation/data" },
    @{ src = "sections"; dest = "public/invitation/sections" }
)

foreach ($item in $ItemsToMove) {
    $srcPath = Join-Path $PSScriptRoot $item.src
    $destPath = Join-Path $PSScriptRoot $item.dest

    if (Test-Path $srcPath) {
        if (Test-Path $destPath) {
            Write-Host "[!] Target already exists at $($item.dest). Skipping $($item.src) to prevent overwrite." -ForegroundColor Yellow
        } else {
            Move-Item -Path $srcPath -Destination $destPath -Force
            Write-Host "[✔] Moved: $($item.src) -> $($item.dest)" -ForegroundColor Green
        }
    } else {
        Write-Host "[i] Source not found (already moved or missing): $($item.src)" -ForegroundColor Gray
    }
}

# Promote index.react.html to index.html
$ReactSrc = Join-Path $PSScriptRoot "index.react.html"
$ReactDest = Join-Path $PSScriptRoot "index.html"

if (Test-Path $ReactSrc) {
    Move-Item -Path $ReactSrc -Destination $ReactDest -Force
    Write-Host "[✔] Promoted React template: index.react.html -> index.html" -ForegroundColor Green
} else {
    Write-Host "[i] React template already promoted or index.react.html missing." -ForegroundColor Gray
}

Write-Host "`nRelocation setup complete." -ForegroundColor Yellow
Write-Host "Please install Node.js from https://nodejs.org/ if you haven't already, restart your shell, and run:"
Write-Host "  npm install" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Green
