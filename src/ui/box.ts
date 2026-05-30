import chalk from 'chalk';

export function printHeader(title: string): void {
  const width = 50;
  const pad = Math.max(0, width - title.length - 2);
  const leftPad = Math.floor(pad / 2);
  const rightPad = pad - leftPad;
  console.log(chalk.cyan('┌' + '─'.repeat(width) + '┐'));
  console.log(chalk.cyan('│') + ' '.repeat(leftPad) + chalk.bold(title) + ' '.repeat(rightPad) + chalk.cyan('│'));
  console.log(chalk.cyan('└' + '─'.repeat(width) + '┘'));
}

export function printAlert(message: string, type: 'error' | 'warn' | 'info' = 'info'): void {
  const colors = {
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.cyan,
  };
  console.log(colors[type](`⚠️  ${message}`));
}
