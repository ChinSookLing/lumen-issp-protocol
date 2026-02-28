// validate-mappings.js
// Purpose: Lint + schema check for all mapping files in mappings/
// Source: Node-05 suggestion (M73) | Formatted: Node-01 (Architect)

const fs = require('fs');
const path = require('path');

const MAPPINGS_DIR = path.join(__dirname, '..', 'mappings');
const REQUIRED_KEYS = ['pattern_id', 'language', 'triggers', 'weight'];

let errors = 0;
let checked = 0;

function validateMapping(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  let data;

  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`❌ JSON parse error: ${filePath}`);
    errors++;
    return;
  }

  REQUIRED_KEYS.forEach(key => {
    if (!(key in data)) {
      console.error(`❌ Missing key "${key}" in: ${filePath}`);
      errors++;
    }
  });

  checked++;
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (file.endsWith('.json')) {
      validateMapping(full);
    }
  });
}

walk(MAPPINGS_DIR);

console.log(`\nChecked: ${checked} files`);
if (errors > 0) {
  console.error(`Failed: ${errors} error(s)`);
  process.exit(1);
} else {
  console.log('✅ All mappings valid');
}
