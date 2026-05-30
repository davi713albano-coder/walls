#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { watchCmd } from './commands/watch.js';
import { shieldCmd } from './commands/shield.js';
import { snapshotCmd } from './commands/snapshot.js';
import { rollbackCmd } from './commands/rollback.js';
import { auditCmd } from './commands/audit.js';
import { rulesCmd } from './commands/rules.js';
import { initConfig } from './core/config.js';

// make sure .wallsrc exists so this thing even works
initConfig();

const program = new Command();

program
  .name('walls')
  .version('1.0.0')
  .description('filesystem firewall. because who trusts anything anymore.');

// watch everything like a paranoid parent
program
  .command('watch')
  .description('watch filesystem changes in real-time. stare at it if you must.')
  .action(watchCmd);

// shield the things you actually care about
program
  .command('shield')
  .description('shield files and directories from modification')
  .argument('[patterns...]', 'file/directory patterns to shield')
  .option('-l, --list', 'list everything currently shielded')
  .option('-r, --remove <pattern>', 'remove something from the shield')
  .action(shieldCmd);

// snapshot so you can undo the world
program
  .command('snapshot')
  .description('create or manage filesystem snapshots. cheap insurance.')
  .argument('[name]', 'optional name for the snapshot')
  .option('-l, --list', 'list all snapshots')
  .option('-d, --delete <name>', 'delete a snapshot')
  .action(snapshotCmd);

// rollback like your life depends on it
program
  .command('rollback')
  .description('rollback to a previous snapshot. the undo button for reality.')
  .option('-l, --last', 'rollback to the most recent snapshot')
  .option('-n, --name <name>', 'rollback to a specific snapshot')
  .action(rollbackCmd);

// audit because you need receipts
program
  .command('audit')
  .description('generate an audit report of filesystem changes')
  .option('-e, --export <file>', 'export report to file')
  .action(auditCmd);

// rules are the walls. literally.
program
  .command('rules')
  .description('manage filesystem rules')
  .argument('[action]', 'add, remove, or list')
  .argument('[...args]', 'rule arguments')
  .action(rulesCmd);

program.parse();
