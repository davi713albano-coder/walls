// Standalone self-check for snapshot fixes. Run: node test-snapshot.mjs
// No framework — asserts + a temp workspace, cleaned up at the end.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert';

const { createSnapshot, listSnapshots, getLatestSnapshot, rollbackTo } = await import(
  '../dist/core/snapshot.js'
);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'walls-test-'));
const origCwd = process.cwd();
process.chdir(tmp);

try {
  fs.writeFileSync('a.txt', 'v1');

  // --- BUG 3: createdAt is persisted and readable ---
  const snap1 = createSnapshot(tmp, 'snap1');
  assert.ok(snap1.createdAt, 'snapshot should have createdAt');
  const metaPath = path.join(snap1.path, '.walls-meta');
  assert.ok(fs.existsSync(metaPath), '.walls-meta must be written');
  const listed = listSnapshots();
  assert.ok(listed[0].createdAt, 'listed snapshot must expose createdAt from meta');

  // --- BUG 2: snapshot is an independent copy, not a hard link ---
  fs.writeFileSync('a.txt', 'v2-edited');
  const snapContent = fs.readFileSync(path.join(snap1.path, 'a.txt'), 'utf-8');
  assert.strictEqual(snapContent, 'v1', 'snapshot content must not change when original is edited');

  // --- getLatestSnapshot picks the newest by real time ---
  await new Promise((r) => setTimeout(r, 5));
  createSnapshot(tmp, 'snap2');
  const latest = getLatestSnapshot();
  assert.strictEqual(latest.name, 'snap2', 'getLatestSnapshot must return newest');

  // --- rollback restores snapshot content ---
  rollbackTo(snap1, tmp);
  assert.strictEqual(fs.readFileSync('a.txt', 'utf-8'), 'v1', 'rollback should restore v1');

  // --- BUG 1: failed rollback leaves working state intact ---
  fs.writeFileSync('a.txt', 'current-work');
  const badSnap = { ...snap1, path: path.join(tmp, 'does-not-exist') };
  let threw = false;
  try {
    rollbackTo(badSnap, tmp);
  } catch {
    threw = true;
  }
  assert.ok(threw, 'rollback from a broken snapshot should throw');
  assert.ok(fs.existsSync('a.txt'), 'working file must survive a failed rollback');
  assert.strictEqual(
    fs.readFileSync('a.txt', 'utf-8'),
    'current-work',
    'working file content must be intact after a failed rollback'
  );

  console.log('OK — all snapshot self-checks passed');
} finally {
  process.chdir(origCwd);
  fs.rmSync(tmp, { recursive: true, force: true });
}
