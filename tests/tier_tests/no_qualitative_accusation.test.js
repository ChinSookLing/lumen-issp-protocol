const fs = require('fs');
const path = require('path');

test('no_qualitative_accusation: outputs must not contain qualitative accusation phrases', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/TEST-T0-002.json')));
  const text = JSON.stringify(fixture.output).toLowerCase();
  const forbidden = ['is corrupt','is criminal','is a traitor','is guilty','is immoral'];
  forbidden.forEach(p => {
    expect(text).not.toContain(p);
  });
});
