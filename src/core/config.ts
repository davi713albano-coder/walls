import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

export interface Rule {
  action: 'block' | 'warn';
  event: 'delete' | 'write' | 'all';
  pattern: string;
  message?: string;
}

export interface WallyConfig {
  shield?: string[];
  rules?: Rule[];
  snapshots?: {
    auto?: boolean;
    interval?: string;
    max?: number;
  };
}

const WALLS_DIR = '.walls';
const WALLSRC = '.wallsrc';

export function getWallsDir(): string {
  return path.join(process.cwd(), WALLS_DIR);
}

export function ensureWallsDir(): void {
  const dir = getWallsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadConfig(): WallyConfig {
  try {
    if (!fs.existsSync(WALLSRC)) {
      return { shield: [], rules: [], snapshots: {} };
    }
    const content = fs.readFileSync(WALLSRC, 'utf-8');
    return yaml.parse(content) || { shield: [], rules: [], snapshots: {} };
  } catch (err) {
    return { shield: [], rules: [], snapshots: {} };
  }
}

export function saveConfig(config: WallyConfig): void {
  const yamlStr = yaml.stringify(config, { lineWidth: 120 });
  fs.writeFileSync(WALLSRC, yamlStr, 'utf-8');
}

export function initConfig(): void {
  const defaults: WallyConfig = {
    shield: ['.env', '.env.local', 'secrets/'],
    rules: [
      {
        action: 'block',
        event: 'delete',
        pattern: '*.ts',
        message: 'nope. nobody deletes typescript around here.',
      },
      {
        action: 'warn',
        event: 'write',
        pattern: 'package.json',
        message: 'package.json changed — double check it still makes sense',
      },
    ],
    snapshots: {
      auto: true,
      interval: '5m',
      max: 20,
    },
  };

  if (!fs.existsSync(WALLSRC)) {
    saveConfig(defaults);
  }

  ensureWallsDir();
}
