"use strict";
/**
 * time_provider.js
 * Node-05 design (M71 Patch 2), Node-01 landing
 *
 * Deterministic time injection for tests and reproducibility.
 * Usage:
 *   const { createTimeProvider, systemTimeProvider } = require("./time_provider");
 *   const tp = createTimeProvider({ nowMs: () => 1700000000000 });
 *   tp.nowMs(); tp.nowUtcSeconds(); tp.isoUtc();
 */

function systemTimeProvider() {
  return {
    nowMs: () => Date.now(),
    nowUtcSeconds: () => Math.floor(Date.now() / 1000),
    isoUtc: () => new Date(Date.now()).toISOString(),
  };
}

function createTimeProvider(overrides = {}) {
  const sys = systemTimeProvider();
  const tp = {
    nowMs: typeof overrides.nowMs === "function" ? overrides.nowMs : sys.nowMs,
    nowUtcSeconds:
      typeof overrides.nowUtcSeconds === "function"
        ? overrides.nowUtcSeconds
        : () => Math.floor(tp.nowMs() / 1000),
    isoUtc:
      typeof overrides.isoUtc === "function"
        ? overrides.isoUtc
        : () => new Date(tp.nowMs()).toISOString(),
  };
  return tp;
}

module.exports = { systemTimeProvider, createTimeProvider };
