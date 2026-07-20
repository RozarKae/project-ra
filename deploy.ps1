# Deploy script for Project RA

Write-Host "Starting Project RA Deployment..." -ForegroundColor Yellow

# 1. Ensure CNAME is present in public/ directory
if (Test-Path "CNAME") {
    Copy-Item CNAME public/CNAME -Force -ErrorAction SilentlyContinue
}

# 2. Compile the production build
Write-Host "Building production distribution..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Production build failed! Deployment aborted."
    exit 1
}

# 3. Navigate into dist/ folder
Set-Location dist

# 4. Initialize temporary git repository
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy to GitHub Pages (Automated Build)"

# 5. Push the build to remote gh-pages branch
Write-Host "Pushing to gh-pages branch..." -ForegroundColor Cyan
git push -f https://github.com/RozarKae/project-ra.git gh-pages

# 6. Clean up temporary git repository inside dist/
Set-Location ..
Remove-Item dist\.git -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Deployment completed successfully! The website is live at https://batpaiyancatponnu.online/" -ForegroundColor Green
