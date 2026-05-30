import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import Table from 'cli-table3';

interface FileStat {
  path: string;
  adds: number;
  changes: number;
  unlinks: number;
}

// In-memory simple audit log (in production, persist to disk)
const auditLogPath = path.join(process.cwd(), '.walls', 'audit.json');

function loadAuditLog(): any[] {
  if (fs.existsSync(auditLogPath)) {
    try {
      return JSON.parse(fs.readFileSync(auditLogPath, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function auditCmd(opts: { export?: string }): void {
  // Simulated audit data for now (in a real app, track from watcher events)
  const log = loadAuditLog();

  console.log(chalk.bold.cyan('📊 walls audit report'));
  console.log(chalk.gray(`Generated: ${new Date().toISOString()}`));
  console.log('');

  if (log.length === 0) {
    console.log(chalk.yellow('⚠️  No audit data available yet.'));
    console.log(chalk.gray('   Run "walls watch" to start tracking changes.'));
    return;
  }

  // Count events
  let adds = 0;
  let changes = 0;
  let deletes = 0;
  const fileStats: Record<string, FileStat> = {};

  for (const entry of log) {
    if (entry.event === 'add') adds++;
    if (entry.event === 'change') changes++;
    if (entry.event === 'unlink') deletes++;

    if (!fileStats[entry.path]) {
      fileStats[entry.path] = { path: entry.path, adds: 0, changes: 0, unlinks: 0 };
    }
    const key = (entry.event + 's') as keyof FileStat;
    fileStats[entry.path][key]++;
  }

  const table = new Table({
    head: ['Metric', 'Count'],
    colWidths: [30, 10],
  });

  table.push(['Files created', chalk.green(adds.toString())]);
  table.push(['Files modified', chalk.yellow(changes.toString())]);
  table.push(['Files deleted', chalk.red(deletes.toString())]);

  console.log(table.toString());
  console.log('');

  // Most changed files
  const sorted = Object.values(fileStats).sort((a, b) => (b.adds + b.changes) - (a.adds + b.changes)).slice(0, 10);

  if (sorted.length > 0) {
    console.log(chalk.bold.cyan('🔥 Most active files:'));
    const filesTable = new Table({
      head: ['File', 'Adds', 'Changes', 'Deletes'],
      colWidths: [40, 8, 8, 8],
    });

    for (const stat of sorted) {
      filesTable.push([stat.path, String(stat.adds), String(stat.changes), String(stat.unlinks)]);
    }

    console.log(filesTable.toString());
  }

  if (opts.export) {
    const report = `# walls audit report
Generated: ${new Date().toISOString()}

## Summary
- Files created: ${adds}
- Files modified: ${changes}
- Files deleted: ${deletes}

## Most active files
${sorted.map(s => `- ${s.path} (+${s.adds} ~${s.changes} -${s.unlinks})`).join('\n')}
`;

    fs.writeFileSync(opts.export, report, 'utf-8');
    console.log(chalk.green(`\n📄 Report exported to: ${opts.export}`));
  }
}
