<div align="center">

# 🧱 walls

**Firewall de filesystem que protege, monitora e faz rollback de alterações nos seus arquivos**

> Do you trust your filesystem? You shouldn't.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/davi713albano-coder/walls?style=for-the-badge&color=gold)](https://github.com/davi713albano-coder/walls/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/davi713albano-coder/walls?style=for-the-badge&color=blueviolet)](https://github.com/davi713albano-coder/walls/network)
[![GitHub Issues](https://img.shields.io/github/issues/davi713albano-coder/walls?style=for-the-badge&color=red)](https://github.com/davi713albano-coder/walls/issues)
[![Last Commit](https://img.shields.io/github/last-commit/davi713albano-coder/walls?style=for-the-badge&color=green)](https://github.com/davi713albano-coder/walls/commits/main)
[![Repo Size](https://img.shields.io/github/repo-size/davi713albano-coder/walls?style=for-the-badge&color=orange)](https://github.com/davi713albano-coder/walls)

---

</div>

## 📑 Índice

- [🤔 The Problem](#-the-problem)
- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📦 Instalação](#-instalação)
- [📖 Comandos](#-comandos)
- [⚙️ Configuração](#️-configuração)
- [🛠️ Tech Stack](#️-tech-stack)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## 🤔 The Problem

Code that writes to your filesystem is incredibly powerful, but it can:

- Accidentally delete important files you need
- Overwrite configs that took hours to get right
- Mess up your database migrations
- Drop env vars without telling you
- Make changes you didn't ask for

**walls** gives you back control. It's your safety net.

---

## ✨ Features

- 👀 **Watch** — Monitora alterações no filesystem em tempo real
- 🛡️ **Shield** — Protege arquivos e diretórios contra modificações
- 📸 **Snapshot** — Cria snapshots completos do projeto
- ⏪ **Rollback** — Desfaz alterações facilmente
- 📋 **Audit** — Gera relatórios de auditoria das alterações
- 📏 **Rules** — Define regras automáticas para o filesystem

---

## 🚀 Quick Start

```bash
# 1. Create a snapshot before you start
npx walls snapshot

# 2. Watch everything that happens
npx walls watch

# 3. Shield your critical files
npx walls shield .env .env.local secrets/
```

---

## 📦 Instalação

### 📋 Pré-requisitos

| Requisito | Versão | Badge |
|-----------|--------|-------|
| Node.js | ≥ 18.0 | [![Node.js](https://img.shields.io/badge/node-≥18.0-blue)](https://nodejs.org) |
| npm | ≥ 8.0 | [![npm](https://img.shields.io/badge/npm-≥8.0-brightgreen)](https://npmjs.com) |
| Git | ≥ 2.34 | [![Git](https://img.shields.io/badge/git-≥2.34-orange)](https://git-scm.com) |

### 🛠️ Instalação Global

```bash
# Instale globalmente
npm install -g walls

# Ou use diretamente com npx
npx walls <command>
```

---

## 📖 Comandos

### `walls watch`

Watch filesystem changes in real-time. Stare at it if you need to.

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

## ⚙️ Configuração

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

## 🗂️ Estrutura do Projeto

```
📦 walls
├── 📂 src/
│   ├── 📄 index.ts              # CLI principal
│   ├── 📂 commands/             # Comandos da CLI
│   │   ├── 📄 watch.ts
│   │   ├── 📄 shield.ts
│   │   ├── 📄 snapshot.ts
│   │   ├── 📄 rollback.ts
│   │   ├── 📄 audit.ts
│   │   └── 📄 rules.ts
│   ├── 📂 core/                 # Lógica principal
│   │   ├── 📄 config.ts
│   │   ├── 📄 watcher.ts
│   │   └── 📄 snapshot.ts
│   └── 📂 utils/                # Utilitários
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 README.md
└── 📄 LICENSE
```

---

## 🛠️ Tech Stack

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Commander](https://img.shields.io/badge/Commander-12.0+-red?style=flat-square)](https://github.com/tj/commander.js)
[![Chokidar](https://img.shields.io/badge/Chokidar-3.5+-yellow?style=flat-square)](https://github.com/paulmillr/chokidar)
[![Chalk](https://img.shields.io/badge/Chalk-5.3+-green?style=flat-square)](https://github.com/chalk/chalk)

---

## 🗺️ Roadmap

- [x] ✅ **Watch** — watch filesystem changes in real-time
- [x] ✅ **Shield** — protect files and directories
- [x] ✅ **Snapshot** — create full project snapshots
- [x] ✅ **Rollback** — undo changes
- [x] ✅ **Audit** — track what happened
- [x] ✅ **Rules** — define automatic filesystem rules
- [ ] 🚧 **Dashboard** — local web dashboard
- [ ] 🚧 **Desktop Notifications** — native OS notifications for blocked actions
- [ ] 🚧 **Strict Mode** — block everything until you approve
- [ ] 🚧 **VS Code Extension** — plugin for Visual Studio Code
- [ ] 🚧 **Git Integration** — auto-commit snapshots

---

## 🤝 Contribuição

PRs welcome. This is a personal project that grew out of a bad night. If it helps you, great. If you have ideas, open an issue or send a PR.

### 📌 Passo a passo

1. **Fork** este repositório
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/walls.git`
3. **Crie** uma branch: `git checkout -b feat/minha-feature`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova feature'`
5. **Push** para a branch: `git push origin minha-feature`
6. Abra um **Pull Request**

---

## 📄 Licença

MIT — veja [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**davi713albano-coder**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/davi713albano-coder)

---

<div align="center">

⭐ **Se este projeto te ajudou, considere dar uma star!** ⭐

<p align="center">
  <sub>Feito com paranoia e uma dose saudável de cafeína. Mantido por <a href='https://github.com/davi713albano-coder'>@davi713albano-coder</a></sub>
</p>

</div>
