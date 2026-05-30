import { minimatch } from 'minimatch';
import { loadConfig, type Rule } from './config.js';

export type WatchEvent = 'add' | 'change' | 'unlink' | 'unlinkDir' | 'addDir' | 'all';

export interface RuleMatch {
  matched: boolean;
  rule?: Rule;
  isBlocked: boolean;
  isWarned: boolean;
  message: string;
}

export function matchEvent(ruleEvent: Rule['event'], actualEvent: WatchEvent): boolean {
  if (ruleEvent === 'all') return true;
  const eventMap: Record<string, WatchEvent[]> = {
    delete: ['unlink', 'unlinkDir'],
    write: ['add', 'change', 'addDir'],
    all: ['add', 'change', 'unlink', 'unlinkDir', 'addDir'],
  };
  return eventMap[ruleEvent]?.includes(actualEvent) ?? false;
}

export function checkRules(filepath: string, event: WatchEvent): RuleMatch {
  const config = loadConfig();
  const rules = config.rules ?? [];

  const shielded = config.shield ?? [];
  for (const shieldPattern of shielded) {
    const normalized = shieldPattern.endsWith('/') ? shieldPattern.slice(0, -1)
      : shieldPattern;
    if (
      minimatch(filepath, shieldPattern, { dot: true }) ||
      minimatch(filepath, `${normalized}/**`, { dot: true })
    ) {
      return {
        matched: true,
        isBlocked: true,
        isWarned: false,
        message: `nice try, but ${normalized} is under protection 🧱`,
      };
    }
  }

  for (const rule of rules) {
    if (!matchEvent(rule.event, event)) continue;

    const matches = minimatch(filepath, rule.pattern, { dot: true });
    if (!matches) continue;

    const isBlock = rule.action === 'block';
    return {
      matched: true,
      isBlocked: isBlock,
      isWarned: !isBlock,
      message: rule.message ?? (isBlock ? 'Blocked' : 'Warning'),
      rule,
    };
  }

  return { matched: false, isBlocked: false, isWarned: false, message: '' };
}
