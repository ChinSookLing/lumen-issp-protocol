const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

describe("kill-switch drill script", () => {
  it("simulated engaged drill should pass and write report", () => {
    const outputFile = path.join(
      os.tmpdir(),
      `lumen-kill-switch-drill-${Date.now()}-${Math.random().toString(16).slice(2)}.json`
    );

    execFileSync(
      process.execPath,
      [
        "scripts/ci/kill-switch-drill.js",
        "--simulate-engaged",
        "--output",
        outputFile,
      ],
      {
        cwd: path.resolve(__dirname, ".."),
        stdio: "pipe",
      }
    );

    const report = JSON.parse(fs.readFileSync(outputFile, "utf8"));
    assert.equal(report.verdict, "PASS");
    assert.equal(report.kill_switch_state, "ENGAGED");
    assert.equal(report.action_blocked, true);
    assert.equal(report.requires_human_reset, true);

    fs.unlinkSync(outputFile);
  });
});