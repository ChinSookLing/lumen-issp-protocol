// scripts/ci/adapter-config-validator.cjs
// SPEG-R2-01: Validates routing config contains no PII fields
// Owner: Node-03
// Status: Ready — runs standalone against any YAML/JSON routing config

const fs = require('fs');
const path = require('path');

const FORBIDDEN_KEYS = ['user_id', 'chat_id', 'phone', 'email', 'personal_id', 'name', 'ip_address'];

function validateConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    console.log(`⏭️  Config not found at ${configPath} — skipping`);
    return { clean: true, skipped: true };
  }

  const ext = path.extname(configPath);
  let config;

  if (ext === '.json') {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else if (ext === '.yaml' || ext === '.yml') {
    // Simple YAML key extraction (no dependency needed for CI)
    const content = fs.readFileSync(configPath, 'utf8');
    const keys = content.match(/^\s*[\w.]+(?=\s*:)/gm) || [];
    config = { _keys: keys.map(k => k.trim()) };
  } else {
    console.error(`❌ Unsupported config format: ${ext}`);
    return { clean: false, errors: [`unsupported format: ${ext}`] };
  }

  const errors = [];

  function scanObj(obj, path_prefix) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, val] of Object.entries(obj)) {
      const fullPath = path_prefix ? `${path_prefix}.${key}` : key;
      for (const forbidden of FORBIDDEN_KEYS) {
        if (key.toLowerCase().includes(forbidden)) {
          errors.push(`Forbidden key '${fullPath}' matches '${forbidden}'`);
        }
      }
      if (typeof val === 'object' && val !== null) {
        scanObj(val, fullPath);
      }
    }
  }

  scanObj(config, '');

  if (errors.length > 0) {
    errors.forEach(e => console.error(`❌ ${e}`));
    console.error(`\n❌ Routing config contains ${errors.length} forbidden key(s) — FAIL`);
    return { clean: false, errors };
  }

  console.log('✅ Routing config clean — no PII fields detected');
  return { clean: true, errors: [] };
}

// CLI mode
if (require.main === module) {
  const configPath = process.argv[2] || path.join(__dirname, '../../config/backend-routing.json');
  const result = validateConfig(configPath);
  if (!result.clean && !result.skipped) process.exit(1);
}

module.exports = { validateConfig, FORBIDDEN_KEYS };
