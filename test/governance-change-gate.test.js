const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");

function runGate(targetFile) {
  return execFileSync(process.execPath, ["scripts/ci/governance-change-gate.js", targetFile], {
    cwd: repoRoot,
    stdio: "pipe",
  }).toString("utf8");
}

describe("governance-change-gate", () => {
  it("fails when required metadata is missing", () => {
    const relPath = "docs/governance/.tmp-m84-gate-fail.md";
    const absPath = path.resolve(repoRoot, relPath);

    fs.writeFileSync(
      absPath,
      "# temp\nStatus: Draft\nChange Anchor: demo\n",
      "utf8"
    );

    let failed = false;
    try {
      runGate(relPath);
    } catch (error) {
      failed = true;
    } finally {
      fs.unlinkSync(absPath);
    }

    assert.equal(failed, true);
  });

  it("passes when metadata is complete", () => {
    const relPath = "docs/governance/.tmp-m84-gate-pass.md";
    const absPath = path.resolve(repoRoot, relPath);

    fs.writeFileSync(
      absPath,
      [
        "# temp",
        "Status: Draft",
        "Timestamp (UTC): 2026-02-23T00:00:00Z",
        "Change Anchor: demo",
        "Evidence: test evidence",
      ].join("\n") + "\n",
      "utf8"
    );

    const output = runGate(relPath);
    fs.unlinkSync(absPath);

    assert.match(output, /PASSED/);
  });
});