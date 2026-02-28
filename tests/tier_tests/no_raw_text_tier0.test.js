const fs = require('fs');
const path = require('path');

test('no_raw_text_tier0: Tier0 output must not contain raw_text or verbatim excerpts', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/TEST-T0-001.json')));
  const output = JSON.stringify(fixture.output).toLowerCase();
  const forbiddenKeys = ['raw_text', 'verbatim', 'full_text', 'original_text'];
  forbiddenKeys.forEach(k => {
    expect(output).not.toContain(k);
  });
});

test('tier0_required_fields: required fields present', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/TEST-T0-001.json')));
  const out = fixture.output;
  const required = ['scenario','time_scale','window','acri_band','trend','reason_codes','evidence_refs','engine_version','policy_version'];
  required.forEach(f => {
    expect(out).toHaveProperty(f);
  });
});
