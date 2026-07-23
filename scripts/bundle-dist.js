import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const invitationAppDist = path.join(rootDir, 'apps', 'invitation', 'dist');
const invitationStaticPublic = path.join(rootDir, 'apps', 'invitation', 'public', 'invitation');
const adminDist = path.join(rootDir, 'apps', 'admin', 'dist');

console.log('📦 Bundling apps for deployment into root dist/...');

// Clean root dist directory if it exists
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(distDir, { recursive: true });

// Copy Invitation App build to dist/
if (fs.existsSync(invitationAppDist)) {
  console.log('  -> Copying invitation app build to dist/...');
  fs.cpSync(invitationAppDist, distDir, { recursive: true });
} else {
  console.error('❌ Error: apps/invitation/dist does not exist! Run build for invitation app first.');
  process.exit(1);
}

// Promote full-screen invitation static app directly to root dist/
if (fs.existsSync(invitationStaticPublic)) {
  console.log('  -> Promoting full-screen invitation app directly to root dist/...');
  fs.cpSync(invitationStaticPublic, distDir, { recursive: true, force: true });
}

// Copy Admin App to dist/admin/
const adminTargetDir = path.join(distDir, 'admin');
if (fs.existsSync(adminDist)) {
  console.log('  -> Copying admin app to dist/admin/...');
  fs.cpSync(adminDist, adminTargetDir, { recursive: true });
} else {
  console.error('❌ Error: apps/admin/dist does not exist! Run build for admin app first.');
  process.exit(1);
}

// Ensure CNAME and 404.html exist in root dist for GitHub Pages deployment
const staticFilesToEnsure = ['CNAME', '404.html'];
for (const file of staticFilesToEnsure) {
  const targetPath = path.join(distDir, file);
  if (!fs.existsSync(targetPath)) {
    const rootSourcePath = path.join(rootDir, file);
    const publicSourcePath = path.join(rootDir, 'public', file);
    const invitationPublicPath = path.join(rootDir, 'apps', 'invitation', 'public', file);
    
    if (fs.existsSync(invitationPublicPath)) {
      console.log(`  -> Copying ${file} from apps/invitation/public to dist/...`);
      fs.copyFileSync(invitationPublicPath, targetPath);
    } else if (fs.existsSync(rootSourcePath)) {
      console.log(`  -> Copying ${file} from root to dist/...`);
      fs.copyFileSync(rootSourcePath, targetPath);
    } else if (fs.existsSync(publicSourcePath)) {
      console.log(`  -> Copying ${file} from public/ to dist/...`);
      fs.copyFileSync(publicSourcePath, targetPath);
    }
  }
}

console.log('✅ Bundling complete! Unified dist/ structure created successfully.');


