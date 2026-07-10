const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'invitation');

console.log('--- Project RA Relocation Setup ---');

// Create the public/invitation directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`[✔] Created directory: public/invitation`);
} else {
  console.log(`[i] Directory public/invitation already exists.`);
}

const itemsToMove = [
  { src: 'index.html', dest: 'public/invitation/index.html' },
  { src: 'style.css', dest: 'public/invitation/style.css' },
  { src: 'script.js', dest: 'public/invitation/script.js' },
  { src: 'assets', dest: 'public/invitation/assets' },
  { src: 'data', dest: 'public/invitation/data' },
  { src: 'sections', dest: 'public/invitation/sections' }
];

itemsToMove.forEach(item => {
  const srcPath = path.join(__dirname, item.src);
  const destPath = path.join(__dirname, item.dest);
  
  if (fs.existsSync(srcPath)) {
    // Check if the destination already exists
    if (fs.existsSync(destPath)) {
      console.log(`[!] Target already exists at ${item.dest}. Skipping ${item.src} to prevent overwrite.`);
    } else {
      try {
        fs.renameSync(srcPath, destPath);
        console.log(`[✔] Moved: ${item.src} -> ${item.dest}`);
      } catch (err) {
        console.error(`[✘] Failed to move ${item.src}:`, err.message);
      }
    }
  } else {
    console.log(`[i] Source not found (already moved or missing): ${item.src}`);
  }
});

// Rename the React template index.react.html to index.html
const reactTemplateSrc = path.join(__dirname, 'index.react.html');
const reactTemplateDest = path.join(__dirname, 'index.html');

if (fs.existsSync(reactTemplateSrc)) {
  try {
    fs.renameSync(reactTemplateSrc, reactTemplateDest);
    console.log(`[✔] Promoted React template: index.react.html -> index.html`);
  } catch (err) {
    console.error(`[✘] Failed to promote React template:`, err.message);
  }
} else {
  console.log(`[i] React template already promoted or index.react.html missing.`);
}

console.log('\nRelocation setup complete.');
console.log('Run the following commands next:');
console.log('  npm install');
console.log('  npm run dev');
console.log('----------------------------------');

