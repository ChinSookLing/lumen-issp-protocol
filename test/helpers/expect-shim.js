/**
 * expect-shim.js
 * Lightweight Jest-compatible expect() built on node:assert/strict
 * Purpose: Allow Jest-style tests to run under Node.js built-in test runner
 */
"use strict";
const assert = require("node:assert/strict");

function expect(actual) {
  const matchers = {
    toBe(expected) { assert.strictEqual(actual, expected); },
    toEqual(expected) { assert.deepStrictEqual(actual, expected); },
    toBeTruthy() { assert.ok(actual); },
    toBeNull() { assert.strictEqual(actual, null); },
    toContain(item) {
      if (typeof actual === "string") assert.ok(actual.includes(item), `Expected string to contain "${item}"`);
      else if (Array.isArray(actual)) assert.ok(actual.includes(item), `Expected array to contain ${item}`);
      else throw new Error("toContain requires string or array");
    },
    toHaveLength(len) { assert.strictEqual(actual.length, len); },
    toHaveProperty(prop) { assert.ok(prop in actual, `Expected object to have property "${prop}"`); },
    toBeGreaterThan(expected) { assert.ok(actual > expected, `Expected ${actual} > ${expected}`); },
    toBeGreaterThanOrEqual(expected) { assert.ok(actual >= expected, `Expected ${actual} >= ${expected}`); },
    toBeLessThan(expected) { assert.ok(actual < expected, `Expected ${actual} < ${expected}`); },
    toBeLessThanOrEqual(expected) { assert.ok(actual <= expected, `Expected ${actual} <= ${expected}`); },
    
    toBeCloseTo(expected, precision = 2) {
      const pow = Math.pow(10, -precision) / 2;
      assert.ok(Math.abs(actual - expected) < pow, `Expected ${actual} to be close to ${expected}`);
    },
    toThrow(expected) {
      if (expected === undefined) { assert.throws(actual); }
      else if (typeof expected === 'function') { assert.throws(actual, expected); }
      else if (expected instanceof RegExp) { assert.throws(actual, { message: expected }); }
      else { assert.throws(actual, expected); }
    },
    get not() {
      return {
        toBe(expected) { assert.notStrictEqual(actual, expected); },
        toEqual(expected) { assert.notDeepStrictEqual(actual, expected); },
        toBeTruthy() { assert.ok(!actual); },
        toBeNull() { assert.notStrictEqual(actual, null); },
        toContain(item) {
          if (typeof actual === "string") assert.ok(!actual.includes(item), `Expected NOT to contain "${item}"`);
          else if (Array.isArray(actual)) assert.ok(!actual.includes(item));
        },
        toHaveProperty(prop) { assert.ok(!(prop in actual), `Expected NOT to have property "${prop}"`); },
        toThrow() { assert.doesNotThrow(actual); }
      };
    }
  };
  return matchers;
}

module.exports = { expect };
