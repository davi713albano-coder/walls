import chalk from 'chalk';
import { loadConfig, saveConfig, type Rule } from '../core/config.js';

export function rulesCmd(action: string | undefined, args: string[], opts: Record<string, any>): void {
  const config = loadConfig();

  if (!action || action === 'list') {
    const rules = config.rules ?? [];
    if (rules.length === 0) {
      console.log(chalk.gray('No rules defined.'));
      console.log(chalk.gray('Use "walls rules add <action> <event> on <pattern>" to create one.'));
      return;
    }

    console.log(chalk.bold.cyan('📋 Rules:'));
    for (const rule of rules) {
      const actColor = rule.action === 'block' ? chalk.red : chalk.yellow;
      console.log(actColor(`  ${rule.action.toUpperCase()}`) + chalk.gray(` ${rule.event} on `) + chalk.cyan(rule.pattern));
      if (rule.message) {
        console.log(chalk.gray(`    → ${rule.message}`));
      }
    }
    return;
  }

  if (action === 'add') {
    // walls rules add "block delete on *.ts"
    const fullText = args.join(' ');
    const parts = fullText.split(' ');

    // Parse: block|warn  delete|write|all  on  pattern
    if (parts.length < 4 || parts[2] !== 'on') {
      console.log(chalk.red('❌ Invalid rule format.'));
      console.log(chalk.gray('Expected: walls rules add "block delete on *.ts"'));
      return;
    }

    const ruleAction = parts[0] as 'block' | 'warn';
    const event = parts[1] as 'delete' | 'write' | 'all';
    const pattern = parts.slice(3).join(' ');

    const newRule: Rule = {
      action: ruleAction,
      event: event,
      pattern: pattern,
      message: opts.message ?? `${ruleAction === 'block' ? '🚫' : '⚠️'} ${event} on ${pattern}`,
    };

    config.rules = [...(config.rules ?? []), newRule];
    saveConfig(config);

    console.log(chalk.green(`✅ Rule added:`));
    console.log(chalk.gray(`   ${ruleAction} ${event} on "${pattern}"`));
    return;
  }

  if (action === 'remove') {
    const pattern = args.join(' ');
    const before = (config.rules ?? []).length;
    config.rules = (config.rules ?? []).filter((r) => r.pattern !== pattern);
    const after = (config.rules ?? []).length;
    saveConfig(config);

    if (after < before) {
      console.log(chalk.green(`✅ Removed rule for pattern: ${pattern}`));
    } else {
      console.log(chalk.yellow(`⚠️  No rule found for pattern: ${pattern}`));
    }
    return;
  }

  console.log(chalk.red(`❌ Unknown action: ${action}`));
  console.log(chalk.gray('Use: list, add, or remove'));
}
