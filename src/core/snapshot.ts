import fs from 'node:fs';
import path from 'node:path';
import { getWallsDir } from './config.js';

export interface SnapshotInfo {
  name: string;
  path: string;
  createdAt: string;
  size: number; // number of files
  root: string;
}

function getSnapshotsDir(): string {
  return path.join(getWallsDir(), 'snapshots');
}

export function ensureSnapshotsDir(): void {
  const dir = getSnapshotsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function createSnapshot(sourceDir: string, name?: string): SnapshotInfo {
  ensureSnapshotsDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapName = name ?? `snapshot-${timestamp}`;
  const snapPath = path.join(getSnapshotsDir(), snapName);

  if (fs.existsSync(snapPath)) {
    fs.rmSync(snapPath, { recursive: true, force: true });
  }

  let fileCount = 0;

  function copyWithStats(src: string, dest: string) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src);
      for (const entry of entries) {
        if (entry === '.walls' || entry === 'node_modules' || entry === '.git') continue;
        copyWithStats(path.join(src, entry), path.join(dest, entry));
      }
    } else {
      // Always copy contents. Hard links share an inode with the working
      // file, so an in-place edit would silently mutate the snapshot too —
      // a "backup" that changes with the original is not a backup.
      fs.copyFileSync(src, dest);
      fileCount++;
    }
  }

  copyWithStats(sourceDir, snapPath);

  const createdAt = new Date().toISOString();
  // Persist creation time so listSnapshots/getLatestSnapshot can order
  // snapshots correctly. Without this, rollback may target the wrong one.
  fs.writeFileSync(path.join(snapPath, '.walls-meta'), createdAt, 'utf-8');

  return {
    name: snapName,
    path: snapPath,
    createdAt,
    size: fileCount,
    root: sourceDir,
  };
}

export function listSnapshots(): SnapshotInfo[] {
  const dir = getSnapshotsDir();
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir).filter((e) => {
    // Skip hidden or non-directory items
    return !e.startsWith('.') && fs.statSync(path.join(dir, e)).isDirectory();
  });

  return entries
    .map((name): SnapshotInfo | null => {
      const snapPath = path.join(dir, name);
      const metaPath = path.join(snapPath, '.walls-meta');
      let createdAt = '';
      if (fs.existsSync(metaPath)) {
        try {
          createdAt = fs.readFileSync(metaPath, 'utf-8');
        } catch {
          // ignore
        }
      }
      return {
        name,
        path: snapPath,
        createdAt,
        size: countFiles(snapPath),
        root: process.cwd(),
      };
    })
    .filter(Boolean) as SnapshotInfo[];
}

function countFiles(dir: string): number {
  let count = 0;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (entry === '.walls-meta') continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      count += countFiles(full);
    } else {
      count++;
    }
  }
  return count;
}

export function getLatestSnapshot(): SnapshotInfo | null {
  const snaps = listSnapshots();
  if (snaps.length === 0) return null;
  // Sort by creation time (newest first)
  snaps.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
  return snaps[0];
}

export function deleteSnapshot(name: string): boolean {
  const snapPath = path.join(getSnapshotsDir(), name);
  if (fs.existsSync(snapPath)) {
    fs.rmSync(snapPath, { recursive: true, force: true });
    return true;
  }
  return false;
}

const PRESERVED = new Set(['.walls', 'node_modules', '.git']);

export function rollbackTo(snapshot: SnapshotInfo, targetDir: string): void {
  function copy(src: string, dest: string) {
    fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    for (const item of items) {
      if (item === '.walls-meta') continue;
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copy(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Stash the current working state before touching anything. If the restore
  // fails halfway (disk full, permissions, bad snapshot), we roll the target
  // back to exactly how it was instead of leaving it half-wiped. For a tool
  // whose whole job is preventing data loss, a failed rollback must not lose
  // the user's current files.
  const backupDir = path.join(getWallsDir(), `.rollback-backup-${Date.now()}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const entries = fs.readdirSync(targetDir).filter((e) => !PRESERVED.has(e));
  for (const entry of entries) {
    fs.cpSync(path.join(targetDir, entry), path.join(backupDir, entry), {
      recursive: true,
    });
  }

  try {
    for (const entry of entries) {
      fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
    }
    copy(snapshot.path, targetDir);
  } catch (err) {
    // Restore the stashed state so the user is never worse off than before.
    for (const entry of fs.readdirSync(targetDir).filter((e) => !PRESERVED.has(e))) {
      fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
    }
    for (const entry of fs.readdirSync(backupDir)) {
      fs.cpSync(path.join(backupDir, entry), path.join(targetDir, entry), {
        recursive: true,
      });
    }
    throw err;
  } finally {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
}
