// scripts/sync-server-log.js
// Node.js script to commit and push server-setup-log.txt to GitHub

const { execSync } = require('child_process');
const path = require('path');
const logFile = path.join(__dirname, '../data/server-setup-log.txt');

try {
  execSync(`git add ${logFile}`);
  execSync(`git commit -m "chore: update server setup log"`);
  execSync(`git push`);
  console.log('✅ Log file committed and pushed to GitHub.');
} catch (err) {
  console.error('❌ Error syncing log file:', err.message);
}
