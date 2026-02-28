#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const matrixPath = path.resolve(__dirname, "../../config/redline-coverage-matrix.v1.json");

const allowedStatus = new Set(["enforced", "partial-enforced", "gap-tracked"]);

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function main() {
  let errors = 0;

  if (!fs.existsSync(matrixPath)) {
    console.error(`FAIL: matrix not found at ${matrixPath}`);
    process.exit(1);
  }

  let matrix;
  try {
    matrix = readJson(matrixPath);
  } catch (error) {
    console.error(`FAIL: invalid JSON in matrix: ${error.message}`);
    process.exit(1);
  }

  if (!hasNonEmptyArray(matrix.required_clause_ids)) {
    console.error("FAIL: required_clause_ids must be a non-empty array");
    process.exit(1);
  }

  if (!hasNonEmptyArray(matrix.entries)) {
    console.error("FAIL: entries must be a non-empty array");
    process.exit(1);
  }

  const byId = new Map();
  for (const entry of matrix.entries) {
    if (!hasNonEmptyString(entry.clause_id)) {
      console.error("FAIL: entry missing clause_id");
      errors += 1;
      continue;
    }

    if (byId.has(entry.clause_id)) {
      console.error(`FAIL: duplicate clause_id ${entry.clause_id}`);
      errors += 1;
      continue;
    }

    byId.set(entry.clause_id, entry);

    if (!allowedStatus.has(entry.status)) {
      console.error(`FAIL: ${entry.clause_id} invalid status: ${entry.status}`);
      errors += 1;
    }

    if (!hasNonEmptyString(entry.title)) {
      console.error(`FAIL: ${entry.clause_id} missing title`);
      errors += 1;
    }

    if (!hasNonEmptyArray(entry.rule_refs)) {
      console.error(`FAIL: ${entry.clause_id} missing rule_refs`);
      errors += 1;
    }

    if (!hasNonEmptyArray(entry.test_refs)) {
      console.error(`FAIL: ${entry.clause_id} missing test_refs`);
      errors += 1;
    }

    if (!hasNonEmptyArray(entry.evidence_refs)) {
      console.error(`FAIL: ${entry.clause_id} missing evidence_refs`);
      errors += 1;
    }
  }

  for (const required of matrix.required_clause_ids) {
    if (!byId.has(required)) {
      console.error(`FAIL: required clause not covered: ${required}`);
      errors += 1;
    }
  }

  const summary = {
    total_entries: matrix.entries.length,
    required_entries: matrix.required_clause_ids.length,
    enforced: matrix.entries.filter((x) => x.status === "enforced").length,
    partial_enforced: matrix.entries.filter((x) => x.status === "partial-enforced").length,
    gap_tracked: matrix.entries.filter((x) => x.status === "gap-tracked").length,
  };

  console.log("validate-redline-coverage summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (errors > 0) {
    console.error(`FAILED: ${errors} error(s) found`);
    process.exit(1);
  }

  console.log("PASSED: red-line coverage matrix is complete and traceable");
}

main();