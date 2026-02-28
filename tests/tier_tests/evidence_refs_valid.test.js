const fs = require('fs');
const path = require('path');

test('evidence_refs_valid: each evidence_ref must include url, utc (ISO), archived boolean', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/TEST-T0-002.json')));
  const refs = fixture.output.evidence_refs;
  expect(Array.isArray(refs)).toBe(true);
  refs.forEach(r => {
    expect(r).toHaveProperty('url');
    expect(r).toHaveProperty('utc');
    expect(r).toHaveProperty('archived');
    // basic ISO timestamp check
    expect(new Date(r.utc).toString()).not.toBe('Invalid Date');
    expect(typeof r.archived).toBe('boolean');
  });
});
