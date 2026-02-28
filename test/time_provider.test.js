const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { createTimeProvider, systemTimeProvider } = require("../core/time_provider");

describe("Time Provider", () => {
  it("injected nowMs drives utcSeconds and isoUtc", () => {
    const fixed = 1700000000000;
    const tp = createTimeProvider({ nowMs: () => fixed });
    assert.equal(tp.nowMs(), fixed);
    assert.equal(tp.nowUtcSeconds(), Math.floor(fixed / 1000));
    assert.equal(tp.isoUtc(), new Date(fixed).toISOString());
  });

  it("system time provider returns valid values", () => {
    const tp = systemTimeProvider();
    const ms = tp.nowMs();
    assert.ok(Number.isFinite(ms));
    assert.ok(tp.isoUtc().endsWith("Z"));
  });

  it("partial override: only nowMs, others derive", () => {
    const fixed = 1600000000000;
    const tp = createTimeProvider({ nowMs: () => fixed });
    assert.equal(tp.nowMs(), fixed);
    assert.equal(tp.isoUtc(), "2020-09-13T12:26:40.000Z");
  });

  it("no override: falls back to system time", () => {
    const tp = createTimeProvider();
    const before = Date.now();
    const ms = tp.nowMs();
    const after = Date.now();
    assert.ok(ms >= before && ms <= after);
  });
});
