'use strict';
const fs = require('node:fs');

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/perf-to-json.js <input> <output>');
  process.exit(2);
}

const text = fs.readFileSync(inputPath, 'utf8');
const re = /\[processing_time\]\s+(.+?):\s+([\d.]+)ms/;
const samples = [];
for (const line of text.split(/\r?\n/)) {
  const m = line.match(re);
  if (!m) continue;
  const ms = Number(m[2]);
  if (Number.isFinite(ms)) samples.push({ label: m[1].trim(), ms });
}

function quantile(vals, q) {
  if (!vals.length) return null;
  const s = [...vals].sort((a, b) => a - b);
  const p = (s.length - 1) * q;
  const b = Math.floor(p);
  return s[b + 1] === undefined ? s[b] : s[b] + (p - b) * (s[b + 1] - s[b]);
}

const all = samples.map(s => s.ms);
const byLabel = {};
for (const s of samples) (byLabel[s.label] ||= []).push(s.ms);

const out = {
  schema: 'perf.v1',
  generated_at: new Date().toISOString(),
  overall: { n: all.length, p50_ms: quantile(all, 0.5), p95_ms: quantile(all, 0.95) },
  labels: Object.fromEntries(Object.entries(byLabel).map(([k, v]) => [k, {
    n: v.length, p50_ms: quantile(v, 0.5), p95_ms: quantile(v, 0.95),
  }])),
};
fs.writeFileSync(outputPath, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${outputPath} (${samples.length} samples)`);
