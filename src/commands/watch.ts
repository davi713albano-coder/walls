import chalk from 'chalk';
import { startWatching } from '../core/watcher.js';
import { loadConfig } from '../core/config.js';

export function watchCmd(): void {
  const config = loadConfig();
  const shielded = (config.shield ?? []).length;
  const rules = (config.rules ?? []).length;

  // Print header box manually since boxen is ESM and can be flaky
  const header = `
${chalk.cyan('┌─────────────────────────────────────────┐')}
${chalk.cyan('│')}  🧱 walls v1.0.0 — watching ${process.cwd().slice(-30)} |
${chalk.cyan('│')}  shielded: ${shielded} files  |  rules: ${rules} active  |
${chalk.cyan('│')}  Waiting for changes...               |
${chalk.cyan('└─────────────────────────────────────────┘')}
`;
  console.log(header);

  const stop = startWatching(process.cwd());

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.gray('\n👋 Stopping walls watcher...'));
    stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    stop();
    process.exit(0);
  });
}
