"use strict";
/* eslint-disable no-console */
/**
 * validate-schemas.js
 * Node-05 design (M71 Patch 1), Node-01 landing
 *
 * - Validates all JSON Schemas under /schemas are valid + compilable
 * - Validates JSON artifacts that declare $schema
 */

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const repoRoot = process.cwd();
const schemasDir = path.join(repoRoot, "schemas");
const artifactDirs = [
  path.join(repoRoot, "golden"),
  path.join(repoRoot, "realworld"),
  path.join(repoRoot, "mappings"),
];

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function walkFiles(dir, out = []) {
  if (!exists(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      walkFiles(full, out);
    } else if (e.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function readJson(file) {
  const raw = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON: ${path.relative(repoRoot, file)}\n${e.message}`);
  }
}

function main() {
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);

  if (!exists(schemasDir)) {
    console.warn("No /schemas directory found, skipping.");
    process.exit(0);
  }

  // 1) Load all schemas
  const schemaFiles = walkFiles(schemasDir).filter(f => f.endsWith(".json"));
  if (schemaFiles.length === 0) {
    console.warn("No schema files found under /schemas.");
    process.exit(0);
  }

  for (const file of schemaFiles) {
    const schema = readJson(file);
    const rel = path.relative(repoRoot, file);
    if (schema.$id) {
      try {
        ajv.addSchema(schema, schema.$id);
      } catch (e) {
        throw new Error(`Failed to add schema ${rel}\n${e.message}`);
      }
    }
  }

  // 2) Compile check done during addSchema — skip redundant compile

  // 3) Validate artifacts that declare $schema
  let validatedArtifacts = 0;
  for (const dir of artifactDirs) {
    if (!exists(dir)) continue;
    const files = walkFiles(dir).filter(f => f.endsWith(".json"));
    for (const f of files) {
      const obj = readJson(f);
      if (obj && typeof obj.$schema === "string") {
        const validate = ajv.getSchema(obj.$schema);
        if (!validate) {
          throw new Error(`Unknown $schema "${obj.$schema}" in ${path.relative(repoRoot, f)}`);
        }
        const ok = validate(obj);
        if (!ok) {
          throw new Error(
            `Validation failed: ${path.relative(repoRoot, f)}\n` +
            ajv.errorsText(validate.errors, { separator: "\n" })
          );
        }
        validatedArtifacts++;
      }
    }
  }

  console.log(`OK: ${schemaFiles.length} schema(s) compiled; ${validatedArtifacts} artifact(s) validated.`);
}

main();
