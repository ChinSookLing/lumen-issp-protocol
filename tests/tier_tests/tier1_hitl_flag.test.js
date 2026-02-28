const fs = require('fs');
const path = require('path');

test('tier1_hitl_flag: Tier1 exports must include hitl=true and redaction_summary', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/TEST-T1-001.json')));
  const out = fixture.output;
  expect(out).toHaveProperty('hitl');
  expect(out.hitl).toBe(true);
  expect(out).toHaveProperty('redaction_summary');
  expect(typeof out.redaction_summary).toBe('string');
});
