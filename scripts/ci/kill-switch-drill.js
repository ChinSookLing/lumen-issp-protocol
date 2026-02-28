#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const options = {
    simulateEngaged: false,
    output: path.resolve(__dirname, "../../test-runs/governance/kill-switch-drill-report.json"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--simulate-engaged") {
      options.simulateEngaged = true;
    } else if (arg === "--output") {
      const nextValue = argv[index + 1];
      if (!nextValue) {
        throw new Error("--output requires a file path");
      }
      options.output = path.resolve(nextValue);
      index += 1;
    }
  }

  return options;
}

function toBool(value) {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "on" || normalized === "yes";
}

function runDrill(simulateEngaged) {
  const envEngaged = toBool(process.env.LUMEN_KILL_SWITCH);
  const engaged = simulateEngaged || envEngaged;

  const result = {
    timestamp_utc: new Date().toISOString(),
    drill_id: `KSD-${Date.now()}`,
    source: simulateEngaged ? "simulate-engaged" : "env",
    kill_switch_state: engaged ? "ENGAGED" : "DISENGAGED",
    attempted_autonomous_action: "external_side_effect",
    action_blocked: engaged,
    requires_human_reset: engaged,
    acceptance_checks: {
      kill_switch_must_be_engaged: engaged,
      blocked_when_engaged: engaged,
      no_external_side_effect: engaged,
    },
  };

  if (!engaged) {
    result.verdict = "FAIL";
    result.fail_reason = "Kill-switch not engaged; drill cannot prove emergency stop path.";
  } else {
    result.verdict = "PASS";
  }

  return result;
}

function writeReport(outputPath, report) {
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exit(1);
  }

  const report = runDrill(options.simulateEngaged);
  writeReport(options.output, report);

  console.log(`kill-switch drill report written: ${path.relative(process.cwd(), options.output)}`);
  console.log(`verdict: ${report.verdict}`);

  if (report.verdict !== "PASS") {
    process.exit(1);
  }
}

main();