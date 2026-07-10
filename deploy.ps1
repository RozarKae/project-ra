# Deploy script for Project RA

# 1. Copy CNAME to public/ so Vite includes it in the build output
Copy-Item CNAME public/CNAME -Force

# 2. Compile the production build
npm run build

# 3. Navigate into the dist/ output folder
cd dist

# 4. Initialize temporary git repository
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy to GitHub Pages (Automated)"

# 5. Push the build to the remote gh-pages branch
git push -f https://github.com/RozarKae/project-ra.git gh-pages

# 6. Clean up temporary git repository inside dist/
Remove-Item .git -Recurse -Force
cd ..

Write-Host "Deployment completed successfully! The website is updating on GitHub Pages."
