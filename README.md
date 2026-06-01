# walls

> Do you trust your filesystem? You shouldn't.

**walls** is a filesystem firewall i built after an agent deleted my `.env` in production and i had to scramble to fix it at 3am.

it watches. it blocks. it rolls back.

**walls** sits between whatever is touching your filesystem and your actual files. it protects the things you care about, watches what's happening, and lets you undo the world if someone (or something) makes a mess.

---

## The Problem

Code that writes to your filesystem is incredibly powerful, but it can:

- Accidentally delete importantၢ files you need
- Overwrite configs that took hours to get right
- Mess up your database migrations
- Drop env vars without telling you
- Make changes you didn't ask for

**walls** gives you back control. it's your safety net.

---

## Quick Start

```bash
# 1. Create a snapshot before you start
npx walls snapshot

# 2. Watch everything that happens
npx walls watch

# 3. Shield your critical files
npx walls shield .env .env.local secrets/
```

---

## Installation

```bash
npm install -g walls
# or
npx walls <command>
```

---

## Commands

### `walls watch`

Watch filesystem changes in real-time. stare at it if you need to.

```bash
walls watch
```

Shows a live feed of everything being created, edited, or deleted.

### `walls shield`

Protect files and directories from modification.

```bash
walls shield .env .env.local secrets/

# list shielded items
walls shield --list

# remove from shield
walls shield --remove .env.local
```

### `walls snapshot`

Create a full project snapshot before letting anything touch your code.

```bash
# create a snapshot
walls snapshot

# list existing snapshots
walls snapshot --list

# delete a snapshot
walls snapshot --delete <name>
```

### `walls rollback`

Rollback to a previous snapshot.

```bash
# rollback interactively
walls rollback

# rollback to the latest snapshot
walls rollback --last

# rollback to a specific snapshot
walls rollback --name <snapshot-name>
```

### `walls audit`

Generate an audit report of changes.

```bash
# show audit report
walls audit

# export to file
walls audit --export report.md
```

### `walls rules`

Define automatic rules for the filesystem.

```bash
# add a rule
walls rules add "block delete on *.ts"

# list rules
walls rules list

# remove a rule
walls rules remove "*.ts"
```

---

## Configuration

**walls** reads configuration from `.wallsrc` in your project root.

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
    message: "🚫 nobody deletes typescript on my watch"
  - action: warn
    event: write
    pattern: "package.json"
    message: "⚠️ package.json was changed, might want to check that"
  - action: block
    event: write
    pattern: "prisma/migrations/**"
    message: "🚫 migrations are sacred, don't touch"

snapshots:
  auto: true
  interval: 5m
  max: 20
```

---

## Roadmap

- [x] **Watch** — watch filesystem changes in real-time
- [x] **Shield** — protect files and directories
- [x] **Snapshot** — create full project snapshots
- [x] **Rollback** — undo changes
- [x] **Audit** — track what happened
- [x] **Rules** — define automatic filesystem rules
- [ ] **Dashboard** — local web dashboard
- [ ] **Desktop Notifications** — native OS notifications for blocked actions
- [ ] **Strict Mode** — block everything until you approve
- [ ] **VS Code Extension** — plugin for Visual Studio Code
- [ ] **Git Integration** — auto-commit snapshots

---

## Contributing

PRs welcome. this is a personal project that grew out of a bad night. if it helps you, great. if you have ideas, open an issue or send a PR.

---

## License

MIT

---

<sup>Built with paranoia and a healthy dose of caffeine.</sup>

<!-- personal note: this was built after one too many production incidents -->

