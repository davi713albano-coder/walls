import chalk from 'chalk';
import { createSnapshot, listSnapshots, deleteSnapshot } from '../core/snapshot.js';
import type { SnapshotInfo } from '../core/snapshot.js';

export function snapshotCmd(name: string | undefined, opts: { list?: boolean; delete?: string }): void {
  if (opts.list) {
    const snaps = listSnapshots();
    if (snaps.length === 0) {
      console.log(chalk.gray('No snapshots yet.'));
      console.log(chalk.gray('Use "walls snapshot" to create one.'));
      return;
    }

    console.log(chalk.bold.cyan('📸 Snapshots:'));
    for (const snap of snaps) {
      const created = snap.createdAt
        ? new Date(snap.createdAt).toLocaleString()
        : 'unknown';
      console.log(chalk.green(`   • ${snap.name}`));
      console.log(chalk.gray(`     Created: ${created}`));
      console.log(chalk.gray(`     Files: ${snap.size}`));
    }
    return;
  }

  if (opts.delete) {
    const ok = deleteSnapshot(opts.delete);
    if (ok) {
      console.log(chalk.green(`🗑️  Deleted snapshot: ${opts.delete}`));
    } else {
      console.log(chalk.red(`❌ Snapshot not found: ${opts.delete}`));
    }
    return;
  }

  const snap = createSnapshot(process.cwd(), name);
  console.log(chalk.green(`📸 Snapshot created: ${snap.name}`));
  console.log(chalk.gray(`   Files: ${snap.size}`));
  console.log(chalk.gray(`   Path: ${snap.path}`));
}
