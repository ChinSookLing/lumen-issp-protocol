#!/usr/bin/env node
/**
 * CI Gate: validate-vectors
 * M80A decision — Node-05 original design, Node-01 implementation
 *
 * Rules:
 * 1. All JSONL files in golden/ and realworld/ must be valid JSON per line
 * 2. Files matching *-r2* or *-R2* (Round 2+) MUST have scenario + surface
 * 3. Valid scenarios: SOCIAL, WORKPLACE, FINANCIAL, DEVICE, SAFETY_CRITICAL
 * 4. Valid surfaces: human_chat, system_ui, workflow, voice, mixed
 * 5. RW vectors (realworld/) must have privacy_check: true
 */
"use strict";

const fs = require("fs");
const path = require("path");

const VALID_SCENARIOS = new Set([
  "SOCIAL", "WORKPLACE", "FINANCIAL", "DEVICE", "SAFETY_CRITICAL"
]);
const VALID_SURFACES = new Set([
  "human_chat", "system_ui", "workflow", "voice", "mixed"
]);

const SCAN_DIRS = ["golden", "realworld"];
const R2_PATTERN = /[-_]r2|[-_]R2|round[-_]?2/i;

let errors = 0;
let filesScanned = 0;
let vectorsScanned = 0;

for (const dir of SCAN_DIRS) {
  const dirPath = path.resolve(__dirname, "../..", dir);
  if (!fs.existsSync(dirPath)) continue;

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".jsonl"));
  for (const file of files) {
    filesScanned++;
    const filePath = path.join(dirPath, file);
    const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
    const isR2 = R2_PATTERN.test(file);
    const isRW = dir === "realworld";

    for (let i = 0; i < lines.length; i++) {
      vectorsScanned++;
      let obj;
      try {
        obj = JSON.parse(lines[i]);
      } catch (e) {
        console.error(`FAIL: ${file}:${i + 1} — invalid JSON`);
        errors++;
        continue;
      }

      // R2+ files require scenario + surface
      if (isR2) {
        if (!obj.scenario || !VALID_SCENARIOS.has(obj.scenario)) {
          console.error(`FAIL: ${file}:${i + 1} id=${obj.id || "?"} — missing/invalid scenario (got: ${obj.scenario})`);
          errors++;
        }
        if (!obj.surface || !VALID_SURFACES.has(obj.surface)) {
          console.error(`FAIL: ${file}:${i + 1} id=${obj.id || "?"} — missing/invalid surface (got: ${obj.surface})`);
          errors++;
        }
      }

      // RW files require privacy_check
      if (isRW && obj.privacy_check !== true) {
        console.error(`FAIL: ${file}:${i + 1} id=${obj.id || "?"} — missing privacy_check: true`);
        errors++;
      }
    }
  }
}

console.log(`\nvalidate-vectors: ${filesScanned} files, ${vectorsScanned} vectors scanned`);
if (errors > 0) {
  console.error(`FAILED: ${errors} error(s) found`);
  process.exit(1);
} else {
  console.log("PASSED: all vectors valid");
}
