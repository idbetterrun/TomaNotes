<div align="center">
  <img src="public/icon.png" width="128" height="128" style="border-radius: 24px" alt="TomaNotes Logo">
  <h1>TomaNotes</h1>
  <p><b>Secure, Local-first, Cross-platform Note-taking.</b></p>
  <p>一款安全、本地优先、跨平台的专业笔记工具。</p>

  <p>
    <img src="https://img.shields.io/badge/Version-v0.2.0-blue?style=flat-square" alt="Version">
    <img src="https://img.shields.io/badge/Platform-macOS%20|%20Windows-lightgrey?style=flat-square" alt="Platform">
    <img src="https://img.shields.io/badge/Format-TMN-orange?style=flat-square" alt="TMN">
  </p>
</div>

---

## Features

- **Dual Editor Engine** — Switch seamlessly between Tiptap Rich Text (tables, links, images, file attachments) and CodeMirror Markdown with live preview.
- **TMN Cross-platform Format** — Export/import `.tmn` files for lossless round-trip with [Notiee](https://github.com/idbetterrun/notiee) (iOS AI photo note).
- **Layered Security** — Global 6-digit PIN + macOS Touch ID biometric auth + per-note encryption + auto-lock after idle.
- **Full i18n** — English, Simplified Chinese, Traditional Chinese.
- **5 Themes** — White, Gray, Sepia, Dim, Black.
- **Detached Windows** — Open notes in separate Electron windows.
- **Tags, Favorites, Trash** — Full note organization with search and filter.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Electron 41 |
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Rich Text | Tiptap 3 (ProseMirror) |
| Markdown | CodeMirror 6 + react-markdown |
| Animation | Framer Motion |
| Icons | Lucide React |
| ZIP | JSZip (TMN format) |

## Getting Started

```bash
git clone https://github.com/idbetterrun/TomaNotes.git
cd TomaNotes
npm install

# Development
npm run dev      # Vite dev server
npm start        # Electron in dev mode

# Build
npm run build:mac   # macOS .dmg
npm run build:win   # Windows .exe
```

## TMN Format

`.tmn` (TomaNote Markup) is a ZIP-based document format shared with [Notiee](https://github.com/idbetterrun/notiee). It bundles JSON metadata, content, and binary attachments into a single portable file.

```
example.tmn
├── manifest.json     # Metadata, app origin, file index
├── content.json      # Title, content (HTML/Markdown/Plain), tags, encryption
└── attachments/      # Images, files
```

| Export From → Import To | Behavior |
|---|---|
| TomaNotes → Notiee | Rich text auto-converts to plain text for Notiee display; original preserved for round-trip |
| Notiee → TomaNotes | AI-processed content imported with full fidelity; editor metadata restored |

## License

MIT — Copyright © 2025 Tan Qinghua
