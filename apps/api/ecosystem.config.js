// PM2 process definitions for the two language editions of the API.
//
// Each edition is a full, independent backend: its own port and its own
// database. Secrets live in apps/api/.env.bn and apps/api/.env.en, which are
// gitignored and exist ONLY on the VPS — never committed (so they are never
// dual-pushed to the public client repo). This file is safe to commit: it
// contains no secrets, it just reads those env files at start/reload time.
//
//   pm2 startOrReload apps/api/ecosystem.config.js --update-env
//
// Convention: bn = Bangla edition (port 4000), en = English edition (4001).

const fs = require('fs');
const path = require('path');

// Minimal .env parser so we don't depend on dotenv being installed.
function loadEnv(file) {
  const full = path.join(__dirname, file);
  const out = {};
  if (!fs.existsSync(full)) return out;
  for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue; // skips blank lines and # comments
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

const common = {
  cwd: __dirname,
  script: 'dist/main.js',
  instances: 1,
  autorestart: true,
  max_memory_restart: '400M',
};

module.exports = {
  apps: [
    { ...common, name: 'api-bn', env: loadEnv('.env.bn') },
    { ...common, name: 'api-en', env: loadEnv('.env.en') },
  ],
};
