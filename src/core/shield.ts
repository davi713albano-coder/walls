import chalk from 'chalk';
import { loadConfig, saveConfig } from './config.js';

export function addShield(pattern: string): void {
  if (pattern === 'walls' || pattern === '.walls') {
    console.log(chalk.cyan('Who watches the watchmen? 🤔'));
    console.log(chalk.gray('(nice try though)'));
    return;
  }

  const config = loadConfig();
  const shield = config.shield ?? [];

  if (shield.includes(pattern)) {
    console.log(chalk.yellow(`⚠️  ${pattern} is already shielded`));
    return;
  }

  shield.push(pattern);
  config.shield = shield;
  saveConfig(config);

  console.log(chalk.green(`🛡️  Added to shield: ${pattern}`));
  console.log(chalk.gray(`   Total shielded: ${shield.length}`));
}

export function removeShield(pattern: string): void {
  const config = loadConfig();
  const shield = config.shield ?? [];
  const index = shield.indexOf(pattern);

  if (index === -1) {
    console.log(chalk.yellow(`⚠️  ${pattern} was not in the shield`));
    return;
  }

  shield.splice(index, 1);
  config.shield = shield;
  saveConfig(config);

  console.log(chalk.green(`🛡️  Removed from shield: ${pattern}`));
  console.log(chalk.gray(`   Remaining shielded: ${shield.length}`));
}

export function listShield(): void {
  const config = loadConfig();
  const shield = config.shield ?? [];

  if (shield.length === 0) {
    console.log(chalk.gray('No files or directories are shielded.'));
    console.log(chalk.gray('Use "walls shield <pattern>" to protect files.'));
    return;
  }

  console.log(chalk.bold.cyan('🛡️  Shielded items:'));
  for (const item of shield) {
    console.log(chalk.green(`   • ${item}`));
  }
  console.log(chalk.gray(`\nTotal: ${shield.length} shielded`));
}
