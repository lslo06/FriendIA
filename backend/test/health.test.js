const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/index');

test('GET /api/health reports a healthy backend', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    service: 'friendia-backend',
  });
});
