#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "../..");

const ROOT_GOV_FILES = new Set([
  "REDLINES.md",
  "GOVERNANCE.md",
  "DEPLOYMENT_POLICY.md",
  "COMPATIBILITY.md",
  "NAMING.md",
  "TRADEMARKS.md",
  "RESPONSIBILITY.md",
]);

function parseArgs(argv) {
  const options = {
    staged: false,
    files: [],
  };

  for (const arg of argv) {
    if (arg === "--staged") {
      options.staged = true;
      continue;
    }
    options.files.push(arg);
  }

  return options;
}

function getStagedFiles() {
  const raw = execSync("git diff --name-only --cached", {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return raw.split("\n").map((x) => x.trim()).filter(Boolean);
}

function isGovernanceMarkdown(relPath) {
  if (!relPath.endsWith(".md")) {
    return false;
  }

  if (ROOT_GOV_FILES.has(relPath)) {
    return true;
  }

  if (relPath.startsWith("docs/governance/")) {
    return true;
  }

  return false;
}

function checkRequiredLine(content, regex, message, errors) {
  const matched = content.match(regex);
  if (!matched || !matched[1] || matched[1].trim().length === 0) {
    errors.push(message);
  }
}

function validateFile(relPath) {
  const absPath = path.resolve(repoRoot, relPath);
  const errors = [];

  if (!fs.existsSync(absPath)) {
    errors.push("file does not exist in workspace");
    return errors;
  }

  const content = fs.readFileSync(absPath, "utf8");

  checkRequiredLine(content, /^Status:\s*(.+)$/m, "missing Status:", errors);
  checkRequiredLine(content, /^Timestamp \(UTC\):\s*(.+)$/m, "missing Timestamp (UTC):", errors);
  checkRequiredLine(content, /^Change Anchor:\s*(.+)$/m, "missing Change Anchor:", errors);
  checkRequiredLine(content, /^Evidence:\s*(.+)$/m, "missing Evidence:", errors);

  return errors;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  let candidateFiles = options.files;
  if (options.staged) {
    candidateFiles = getStagedFiles();
  }

  const governanceFiles = candidateFiles.filter(isGovernanceMarkdown);
  if (governanceFiles.length === 0) {
    console.log("governance-change-gate: no changed governance markdown files; skipped");
    return;
  }

  let failed = 0;

  for (const relPath of governanceFiles) {
    const errors = validateFile(relPath);
    if (errors.length > 0) {
      failed += 1;
      console.error(`FAIL: ${relPath}`);
      for (const err of errors) {
        console.error(`  - ${err}`);
      }
    } else {
      console.log(`PASS: ${relPath}`);
    }
  }

  if (failed > 0) {
    console.error(`governance-change-gate FAILED: ${failed} file(s) missing required governance metadata`);
    process.exit(1);
  }

  console.log("governance-change-gate PASSED");
}

main();