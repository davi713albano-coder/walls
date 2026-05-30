import { addShield, removeShield, listShield } from '../core/shield.js';

export function shieldCmd(
  patterns: string[],
  opts: { list?: boolean; remove?: string }
): void {
  if (opts.list) {
    listShield();
    return;
  }

  if (opts.remove) {
    removeShield(opts.remove);
    return;
  }

  if (patterns.length === 0) {
    listShield();
    return;
  }

  for (const pattern of patterns) {
    addShield(pattern);
  }
}
