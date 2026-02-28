const fs = require('fs');
const path = require('path');

test('reason_codes_explainable: each reason_code must map to docs/reason_codes.md', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/TEST-T0-002.json')));
  const reasonCodes = fixture.output.reason_codes;
  const rcDoc = fs.readFileSync(path.join(__dirname, '../../docs/reason_codes.md'), 'utf8');
  reasonCodes.forEach(code => {
    expect(rcDoc).toMatch(new RegExp(`^\\-\\s*${code}\\b`, 'm'));
  });
});
