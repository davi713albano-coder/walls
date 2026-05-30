import chokidar from 'chokidar';
import chalk from 'chalk';
import path from 'node:path';
import { checkRules } from './rules.js';
import type { WatchEvent } from './rules.js';

let changeCount = 0;
let blockedEvents: string[] = [];
let warnedEvents: string[] = [];

export function getStats() {
  return { changeCount, blockedEvents, warnedEvents };
}

export function resetStats() {
  changeCount = 0;
  blockedEvents = [];
  warnedEvents = [];
}

export function startWatching(cwd: string): () => void {
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.bold.cyan('🧱 walls — watching everything you love'));
  console.log(chalk.gray('shielded: loading... | rules: loading...'));
  console.log(chalk.gray('Press Ctrl+C to stop staring'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log('');

  const watcher = chokidar.watch(cwd, {
    ignored: [/node_modules/, /.git/, /.walls/, /dist/],
    persistent: true,
    ignoreInitial: true,
  });

  const formatTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 8);
  };

  const symbols: Record<WatchEvent, string> = {
    add: '🆕',
    change: '✏️',
    unlink: '❌',
    addDir: '📁',
    unlinkDir: '🗑️',
    all: '👀',
  };

  const eventColor: Record<WatchEvent, (s: string) => string> = {
    add: chalk.green,
    change: chalk.yellow,
    unlink: chalk.red,
    addDir: chalk.green,
    unlinkDir: chalk.red,
    all: chalk.gray,
  };

  watcher
    .on('add', (filepath: string) => handleEvent('add', filepath))
    .on('change', (filepath: string) => handleEvent('change', filepath))
    .on('unlink', (filepath: string) => handleEvent('unlink', filepath))
    .on('addDir', (filepath: string) => handleEvent('addDir', filepath))
    .on('unlinkDir', (filepath: string) => handleEvent('unlinkDir', filepath))
    .on('error', (err: Error) => {
      console.error(chalk.red("watcher died: " + err.message));
    });

  function handleEvent(event: WatchEvent, filepath: string) {
    const relativePath = path.relative(cwd, filepath);
    const match = checkRules(relativePath, event);

    if (match.isBlocked) {
      console.log(chalk.bold.red('🧱  BLOCKED ' + event + ' > ' + relativePath));
      if (match.message) {
        console.log(chalk.red('      ' + match.message));
      }
      blockedEvents.push(relativePath);
      return;
    }

    if (match.isWarned) {
      console.log(chalk.yellow('⚠️  ' + (symbols[event] || '👀') + '  ' + relativePath));
      if (match.message) {
        console.log(chalk.yellow('      ' + match.message));
      }
      warnedEvents.push(relativePath);
      changeCount++;
      return;
    }

    changeCount++;
    const sym = symbols[event] || '👀';
    const color = eventColor[event] || chalk.gray;
    const msg = formatTime() + '  ' + sym + '  ' + relativePath;
    console.log(color(msg));
  }

  return () => {
    watcher.close();
  };
}
