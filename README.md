<div align="center">

```
 __        __   _    _
 \ \      / /__| |__| | __ _ _ __
  \ \ /\ / / _ \ '_ \ |/ _` | '__|
   \ V  V \  __/ |_) | | (_| | |
    \_/\_/ \___|_.__/|_|\__,_|_|
```

# walls

**A filesystem firewall that protects, monitors, and rolls back file changes.**

> An AI deleted my `.env` in production and I haven't been the same since.

[![npm version](https://img.shields.io/npm/v/walls?style=for-the-badge&color=blue)](https://www.npmjs.com/package/walls)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/davi713albano-coder/walls?style=for-the-badge&color=gold)](https://github.com/davi713albano-coder/walls/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/davi713albano-coder/walls?style=for-the-badge&color=red)](https://github.com/davi713albano-coder/walls/issues)
[![Last Commit](https://img.shields.io/github/last-commit/davi713albano-coder/walls?style=for-the-badge&color=green)](https://github.com/davi713albano-coder/walls/commits/master)

</div>

---

## Why walls?

Your filesystem gets hammered every day &mdash; by build scripts, package managers, AI coding agents, stray `rm -rf` commands, and your own typos. One bad write can wipe out hours of configuration. One accidental delete can take down production.

**walls is the safety net.** It watches every file change in real time, blocks modifications to files you've protected, snapshots your project so you can undo anything, and gives you a full audit trail of what happened.

### The problem it solves

- Accidentally delete important files
- Overwrite configs that took hours to get right
- Let scripts or agents touch files they shouldn't
- Lose `.env` variables without knowing
- Have zero record of who changed what and when

---

## Features

| Feature | Description |
|---------|-------------|
| **Watch** | Monitor file changes in real time &mdash; creates, edits, deletes, directory changes all stream to your terminal |
| **Shield** | Protect files and directories from any modification &mdash; blocked writes get rejected on contact |
| **Snapshot** | Capture a full project snapshot with one command &mdash; uses hard links when possible for zero-cost copies |
| **Rollback** | Restore your project to any previous snapshot &mdash; interactive or one-flag `--last` |
| **Audit** | Generate change reports with file-level stats &mdash; exportable to Markdown |
| **Rules** | Define block/warn policies by glob pattern and event type &mdash; enforced automatically during watch |

---

## Quick Start

```bash
# Run instantly with npx (no install needed)
npx walls snapshot          # snapshot your project before anything touches it
npx walls watch             # start real-time monitoring
npx walls shield .env secrets/   # protect critical files
```

Or install globally:

```bash
npm install -g walls
walls snapshot
walls watch
```

**Prerequisites:** Node.js >= 18, npm >= 8.

---

## Usage

### watch &mdash; Real-time filesystem monitor

Starts a persistent watcher that streams every file event to your terminal. Blocked and warned events are highlighted automatically.

```bash
walls watch
```

Output while running:

```
14:32:01  🆕  src/new-file.ts
14:32:03  ✏️  package.json
🧱  BLOCKED change > .env
      nice try, but .env is under protection 🧱
⚠️  ✏️  package.json
      package.json changed — double check it still makes sense
```

Press `Ctrl+C` to stop.

### shield &mdash; Protect files from modification

Add files or directories to the shield list. Shielded paths are checked automatically during `walls watch` &mdash; any attempt to modify them is blocked.

```bash
# Protect files and directories
walls shield .env .env.local secrets/ docker-compose.prod.yml

# List currently shielded items
walls shield --list

# Remove a path from the shield
walls shield --remove .env.local
```

Shielding a directory also protects every file inside it (recursive glob match).

### snapshot &mdash; Capture a point-in-time copy

Creates a full copy of your project (skipping `node_modules/`, `.git/`, and `.walls/`). Uses hard links when the filesystem supports it, so snapshots cost near-zero disk space.

```bash
# Create a snapshot (auto-named with timestamp)
walls snapshot

# Name it yourself
walls snapshot before-refactor

# List all snapshots
walls snapshot --list

# Delete a snapshot
walls snapshot --delete snapshot-2024-06-27T14-30-00-000Z
```

### rollback &mdash; Undo everything

Restore your project to a previous snapshot. Overwrites current files (preserving `.walls/`, `node_modules/`, and `.git/`).

```bash
# Interactive: pick from a numbered list
walls rollback

# Rollback to the most recent snapshot
walls rollback --last

# Rollback to a specific snapshot by name
walls rollback --name before-refactor
```

Rollback always asks for confirmation before overwriting files.

### audit &mdash; Change report

Shows a summary of creates, modifications, and deletes tracked by `walls watch`. Includes a per-file breakdown of the most active files.

```bash
# Print report to terminal
walls audit

# Export to a Markdown file
walls audit --export report.md
```

### rules &mdash; Automatic block and warn policies

Rules are enforced during `walls watch`. Each rule has an **action** (`block` or `warn`), an **event** (`delete`, `write`, or `all`), and a **glob pattern**.

```bash
# Block all deletes to TypeScript files
walls rules add "block delete on *.ts"

# Warn when package.json is written to
walls rules add "warn write on package.json"

# Block any write under prisma/migrations
walls rules add "block write on prisma/migrations/**"

# List active rules
walls rules list

# Remove a rule
walls rules remove "*.ts"
```

Rules are evaluated in order. Shield entries take priority over all rules.

---

## How It Works

### Protection via shield + rules

When `walls watch` is running, every filesystem event (create, change, delete) passes through the rule engine before anything is logged:

1. **Shield check** &mdash; If the affected file matches any shielded path (direct match or recursive glob), the event is **blocked immediately**.
2. **Rule evaluation** &mdash; Rules are checked in order. The first matching rule decides the outcome:
   - `block` &mdash; the event is rejected and logged in red
   - `warn` &mdash; the event is allowed but logged in yellow with a warning message
3. **Pass-through** &mdash; If no shield or rule matches, the event is logged normally

This means protected files can't be modified, deleted, or overwritten while the watcher is active.

### Monitoring via chokidar

`walls watch` uses [Chokidar](https://github.com/paulmillr/chokidar) to recursively watch your project directory (automatically ignoring `node_modules/`, `.git/`, `.walls/`, and `dist/`). Every event is timestamped, color-coded, and streamed to your terminal. Blocked and warned events are tracked for the audit report.

### Snapshots and rollback

Snapshots are stored under `.walls/snapshots/` in your project root. Each snapshot captures every file in your project (excluding `node_modules/`, `.git/`, and `.walls/`). When possible, files are hard-linked instead of copied, keeping disk usage minimal.

Rollback clears your working directory (preserving `.walls/`, `node_modules/`, and `.git/`) and restores every file from the chosen snapshot. This is a full restore &mdash; files that didn't exist in the snapshot are removed.

---

## Configuration

walls reads a `.wallsrc` file (YAML) from your project root. If none exists, it creates one with sensible defaults on first run.

```yaml
shield:
  - .env
  - .env.local
  - secrets/
  - docker-compose.prod.yml

rules:
  - action: block
    event: delete
    pattern: "*.ts"
    message: "nobody deletes typescript around here"
  - action: warn
    event: write
    pattern: "package.json"
    message: "package.json changed — double check it still makes sense"
  - action: block
    event: write
    pattern: "prisma/migrations/**"
    message: "migrations are sacred, don't touch"

snapshots:
  auto: true
  interval: 5m
  max: 20
```

| Field | Description |
|-------|-------------|
| `shield` | List of file/directory patterns to protect from any modification |
| `rules` | List of rule objects with `action`, `event`, `pattern`, and optional `message` |
| `snapshots.auto` | Enable automatic snapshots |
| `snapshots.interval` | Time between auto-snapshots (e.g. `5m`, `1h`) |
| `snapshots.max` | Maximum number of snapshots to keep |

**Rule actions:** `block` (reject the change) or `warn` (allow but alert).
**Rule events:** `delete` (file removal), `write` (create or modify), or `all` (any event).

---

## Roadmap

- [x] Watch &mdash; real-time filesystem monitoring
- [x] Shield &mdash; protect files and directories from modification
- [x] Snapshot &mdash; full project snapshots with hard-link optimization
- [x] Rollback &mdash; restore from any snapshot
- [x] Audit &mdash; change reports with file-level stats
- [x] Rules &mdash; automatic block/warn policies by pattern and event
- [ ] Dashboard &mdash; local web dashboard for monitoring
- [ ] Desktop Notifications &mdash; native OS notifications for blocked actions
- [ ] Strict Mode &mdash; block everything until explicitly approved
- [ ] VS Code Extension &mdash; editor integration
- [ ] Git Integration &mdash; auto-commit snapshots

---

## Project Structure

```
walls/
├── src/
│   ├── index.ts                # CLI entry point
│   ├── commands/               # CLI command handlers
│   │   ├── watch.ts
│   │   ├── shield.ts
│   │   ├── snapshot.ts
│   │   ├── rollback.ts
│   │   ├── audit.ts
│   │   └── rules.ts
│   ├── core/                   # Core logic
│   │   ├── config.ts           # .wallsrc loading and defaults
│   │   ├── rules.ts            # Rule matching engine
│   │   ├── shield.ts           # Shield list management
│   │   ├── watcher.ts          # Filesystem watcher with rule enforcement
│   │   └── snapshot.ts         # Snapshot creation, listing, and rollback
│   └── ui/                     # Terminal output helpers
│       └── box.ts
├── package.json
├── tsconfig.json
└── LICENSE
```

---

## Contributing

PRs are welcome. Open an issue to discuss ideas, or send a pull request directly.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add strict mode"
   git commit -m "fix: correct watcher crash on symlink"
   git commit -m "docs: update README"
   ```
4. Push and open a Pull Request: `git push origin feat/my-feature`

| Prefix | Use | Example |
|--------|-----|---------|
| `feat:` | New feature | `feat: add strict mode` |
| `fix:` | Bug fix | `fix: correct watcher crash` |
| `docs:` | Documentation | `docs: update README` |
| `style:` | Formatting | `style: format with prettier` |
| `refactor:` | Refactoring | `refactor: optimize watcher` |
| `test:` | Tests | `test: add snapshot tests` |
| `chore:` | Build/CI | `chore: add GitHub Actions` |

---

## License

MIT &mdash; see [LICENSE](LICENSE) for details.

Built with paranoia and a healthy dose of caffeine by [davi713albano-coder](https://github.com/davi713albano-coder).
