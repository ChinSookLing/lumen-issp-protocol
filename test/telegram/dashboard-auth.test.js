// test/telegram/dashboard-auth.test.js
// Tests for DASHBOARD_TOKEN auth guard on dashboard endpoints
// Owner: Node-01 (Architect) — M91 security patch

'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

describe('Dashboard Auth Guard (DASHBOARD_TOKEN)', () => {
  const SECRET = 'test-secret-token-lumen-' + Date.now();
  let server;
  let baseUrl;

  before(async () => {
    process.env.DASHBOARD_TOKEN = SECRET;
    process.env.PORT = '0';
    const modPath = require.resolve('../../src/telegram/webhook-server');
    delete require.cache[modPath];
    try { delete require.cache[require.resolve('../../src/dashboard/dashboard-store')]; } catch { /* */ }

    const { handleWebhook } = require('../../src/telegram/webhook-server');
    server = http.createServer(handleWebhook);
    await new Promise(resolve => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    delete process.env.DASHBOARD_TOKEN;
  });

  function fetchPath(path) {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${path}`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }).on('error', reject);
    });
  }

  it('/api/recent without token → 401', async () => {
    const { status, body } = await fetchPath('/api/recent');
    assert.equal(status, 401);
    assert.ok(body.error && body.error.includes('Unauthorized'));
  });

  it('/api/recent with correct ?token= → 200', async () => {
    const { status, body } = await fetchPath(`/api/recent?token=${SECRET}`);
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.items));
  });

  it('/api/stats without token → 401', async () => {
    const { status } = await fetchPath('/api/stats');
    assert.equal(status, 401);
  });

  it('/api/stats with correct token → 200', async () => {
    const { status, body } = await fetchPath(`/api/stats?token=${SECRET}`);
    assert.equal(status, 200);
    assert.ok(typeof body.count === 'number');
  });

  it('/api/item/xxx without token → 401', async () => {
    const { status } = await fetchPath('/api/item/nonexistent');
    assert.equal(status, 401);
  });

  it('/api/item/xxx with token → 404 (auth passed, not found)', async () => {
    const { status } = await fetchPath(`/api/item/nonexistent?token=${SECRET}`);
    assert.equal(status, 404);
  });

  it('/dashboard without token → 401', async () => {
    const { status } = await fetchPath('/dashboard');
    assert.equal(status, 401);
  });

  it('/api/recent with wrong token → 401', async () => {
    const { status } = await fetchPath('/api/recent?token=wrong');
    assert.equal(status, 401);
  });

  it('/ health endpoint always open', async () => {
    const { status } = await fetchPath('/');
    assert.equal(status, 200);
  });
});
