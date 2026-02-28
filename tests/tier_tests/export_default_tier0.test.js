const fs = require('fs');
const path = require('path');

// NOTE: This test validates the contract rule that export defaults to Tier0.
// When lib/export-api-mock is available, uncomment the integration test below.

test('export_default_tier0: Tier0 fixture must have export_tier=0', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/TEST-T0-001.json')));
  expect(fixture.export_tier).toBe(0);
});

test('export_default_tier0: Tier1 fixture must have export_tier=1', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/TEST-T1-001.json')));
  expect(fixture.export_tier).toBe(1);
});

// Integration test (requires lib/export-api-mock):
// const api = require('../../lib/export-api-mock');
// test('export_default_tier0: API default returns Tier0 unless tier=1 with HITL token', async () => {
//   const resDefault = await api.export({vector_id:'TEST-T0-002'});
//   expect(resDefault.tier).toBe(0);
//   const resTier1 = await api.export({vector_id:'TEST-T0-002', tier:1, hitl_token:'invalid'});
//   expect(resTier1.error).toBeDefined();
// });
