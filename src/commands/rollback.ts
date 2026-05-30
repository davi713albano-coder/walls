import chalk from 'chalk';
import { listSnapshots, getLatestSnapshot, rollbackTo } from '../core/snapshot.js';
import type { SnapshotInfo } from '../core/snapshot.js';
import * as readline from 'node:readline';

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function rollbackCmd(opts: { last?: boolean; name?: string }): Promise<void> {
  const snaps = listSnapshots();

  if (snaps.length === 0) {
    console.log(chalk.red('❌ No snapshots available.'));
    console.log(chalk.gray('   Run "walls snapshot" first.'));
    return;
  }

  let target: SnapshotInfo | null = null;

  if (opts.last) {
    target = getLatestSnapshot();
    if (target) {
      console.log(chalk.cyan(`Rolling back to latest: ${target.name}`));
    }
  } else if (opts.name) {
    target = snaps.find((s) => s.name === opts.name) ?? null;
    if (!target) {
      console.log(chalk.red(`❌ Snapshot not found: ${opts.name}`));
      return;
    }
  } else {
    console.log(chalk.bold.cyan('📸 Available snapshots:'));
    for (let i = 0; i < snaps.length; i++) {
      const snap = snaps[i];
      const date = snap.createdAt ? new Date(snap.createdAt).toLocaleString() : 'unknown';
      console.log(chalk.green(`  [${i + 1}] ${snap.name} (${snap.size} files, ${date})`));
    }
    console.log('');

    const answer = await prompt(chalk.yellow('Enter number to rollback (or "cancel"): '));
    if (answer.toLowerCase() === 'cancel') {
      console.log(chalk.gray('Rollback cancelled.'));
      return;
    }

    const index = parseInt(answer, 10) - 1;
    if (isNaN(index) || index < 0 || index >= snaps.length) {
      console.log(chalk.red('❌ Invalid selection.'));
      return;
    }
    target = snaps[index];
  }

  if (!target) {
    console.log(chalk.red('❌ Could not determine rollback target.'));
    return;
  }

  const confirm = await prompt(
    chalk.yellow(`Rollback to "${target.name}"? This will overwrite current files. [y/N]: `)
  );
  if (confirm.toLowerCase() !== 'y') {
    console.log(chalk.gray('Rollback cancelled.'));
    return;
  }

  rollbackTo(target, process.cwd());
  console.log(chalk.green(`✅ Rolled back to: ${target.name}`));
}
