const fs = require('fs');
const path = require('path');

test('tier1_access_log: access to Tier1 artifacts must generate access_log entries', () => {
  const log = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/TEST-T1-access-log.json')));
  expect(Array.isArray(log.entries)).toBe(true);
  log.entries.forEach(e => {
    expect(e).toHaveProperty('user_id');
    expect(e).toHaveProperty('timestamp');
    expect(e).toHaveProperty('purpose');
    expect(new Date(e.timestamp).toString()).not.toBe('Invalid Date');
  });
});
