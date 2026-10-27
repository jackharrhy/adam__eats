#!/bin/sh
# Check both the first-boot setup gate and a seeded recipe site, entirely offline.
set -eu
container=$(docker run -d --network none --tmpfs /app/data \
  -e EMDASH_ENCRYPTION_KEY=emdash_enc_v1_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA \
  "${1:?built image required}")
trap 'docker logs "$container"; docker rm -f "$container" >/dev/null' EXIT

docker exec -i "$container" node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import Database from 'better-sqlite3';
import sharp from 'sharp';
assert.equal(process.versions.node.split('.')[0], '26');
assert.equal(process.config.variables.v8_enable_pointer_compression, 1);
// Exercise EmDash's own V8 addon as well as the direct N-API dependency.
const emdashRequire = createRequire(import.meta.resolve('emdash'));
for (const SQLite of [Database, emdashRequire('better-sqlite3')]) {
  const db = new SQLite(':memory:');
  db.exec('CREATE TABLE runtime_probe(value INTEGER); INSERT INTO runtime_probe VALUES (26)');
  assert.equal(db.prepare('SELECT value FROM runtime_probe').get().value, 26);
  db.close();
}
const image = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } }).png().toBuffer();
assert.equal((await sharp(image).metadata()).width, 2);
async function get(path) {
  let response;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { response = await fetch(`http://127.0.0.1:4321${path}`); break; }
    catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  assert.equal(response?.status, 200, path);
  console.log(path, response.status);
  return response;
}
assert.equal((await (await get('/_emdash/api/setup/status')).json()).data.needsSetup, true);
execFileSync('node', ['node_modules/emdash/dist/cli/index.mjs', 'seed', 'seed/seed.json', '--database', './data/emdash.db'], { stdio: 'inherit' });
// A completed-setup fixture avoids automating passkey enrollment or sending email.
const db = new Database('./data/emdash.db');
db.prepare('INSERT INTO options(name,value) VALUES (?,?) ON CONFLICT(name) DO UPDATE SET value=excluded.value').run('emdash:setup_complete', 'true');
db.close();
assert.match(await (await get('/')).text(), /Buljol/);
assert.match(await (await get('/recipes/buljol')).text(), /salt cod/i);
console.log(process.version, 'pointer compression=1; both SQLite addons, setup gate, seed, recipes and sharp OK');
JS
