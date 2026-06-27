const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const adminDir = path.join(__dirname, '../src/app/admin');
const backupDir = path.join(__dirname, '../src/admin-backup');

let moved = false;

try {
  if (fs.existsSync(adminDir)) {
    console.log('Moving admin folder to backup to bypass static export server actions limit...');
    fs.renameSync(adminDir, backupDir);
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
    fs.renameSync(backupDir, adminDir);
    console.log('Admin folder restored.');
  }
}
