const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const adminDir = path.join(__dirname, '../src/app/admin');
const backupDir = path.join(__dirname, '../src/admin-backup');

function renameWithRetry(src, dest, retries = 5, delay = 250) {
  for (let i = 0; i < retries; i++) {
    try {
      fs.renameSync(src, dest);
      return;
    } catch (err) {
      if (err.code === 'EPERM' && i < retries - 1) {
        console.log(`Rename locked, retrying in ${delay}ms... (${i + 1}/${retries})`);
        const limit = Date.now() + delay;
        while (Date.now() < limit) {} // synchronous sleep
      } else {
        throw err;
      }
    }
  }
}

let moved = false;

try {
  if (fs.existsSync(adminDir)) {
    console.log('Moving admin folder to backup to bypass static export server actions limit...');
    renameWithRetry(adminDir, backupDir);
    moved = true;
  }

  console.log('Running Next.js static build...');
  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_BUILD_TARGET: 'app' }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exitCode = 1;
} finally {
  if (moved && fs.existsSync(backupDir)) {
    console.log('Restoring admin folder from backup...');
    try {
      renameWithRetry(backupDir, adminDir);
      console.log('Admin folder restored.');
    } catch (err) {
      console.error('Failed to restore admin folder. Please manually rename src/admin-backup to src/app/admin.', err);
    }
  }
}
