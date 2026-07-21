import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const invitationDist = path.join(rootDir, 'apps', 'invitation', 'dist');
const adminDist = path.join(rootDir, 'apps', 'admin', 'dist');

console.log('📦 Bundling apps for deployment into root dist/...');

// Clean root dist directory if it exists
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(distDir, { recursive: true });

// Copy Invitation App to dist/
if (fs.existsSync(invitationDist)) {
  console.log('  -> Copying invitation app to dist/...');
  fs.cpSync(invitationDist, distDir, { recursive: true });
} else {
  console.error('❌ Error: apps/invitation/dist does not exist! Run build for invitation app first.');
  process.exit(1);
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

console.log('✅ Bundling complete! Unified dist/ structure created successfully.');
