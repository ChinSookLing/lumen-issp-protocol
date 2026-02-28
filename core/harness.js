/**
 * Lumen ISSP — Multi-turn Harness
 * Extracted from vs.js per Node-05 M40 requirement:
 * "parseTurns 必須抽成獨立模組 + 單元測試"
 *
 * Purpose: Parse multi-turn conversation input into structured turns.
 * Used by: Vacuum-2 (Structural Silence) and future multi-turn Patterns.
 *
 * Input format: lines separated by \n
 * Each line optionally prefixed with speaker marker (U:/T:/A:/B:)
 */

"use strict";

/**
 * Parse multi-turn input into turns.
 * @param {string} input - newline-separated conversation
 * @returns {Array<{speaker: string, text: string, index: number}>}
 */
function parseTurns(input) {
  const lines = input.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  return lines.map((line, i) => {
    const match = line.match(/^([A-Za-z]):?\s*(.*)/);
    if (match) {
      return { speaker: match[1].toUpperCase(), text: match[2], index: i };
    }
    return { speaker: "?", text: line, index: i };
  });
}

/**
 * Check if input is multi-turn format (contains newlines with speaker markers).
 */
function isMultiTurn(input) {
  return input.includes("\n") && /^[A-Za-z]:/.test(input.trim());
}

module.exports = { parseTurns, isMultiTurn };
