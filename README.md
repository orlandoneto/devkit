<div align="center">

# 🧰 devKit

**Free, open-source developer tools that run 100% in your browser.**

Generate test data, validate documents, encode/decode, format JSON, build QR codes and more — no sign-up, no tracking by default, nothing sent to a server.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub stars](https://img.shields.io/github/stars/orlandoneto/devkit?style=social)](https://github.com/orlandoneto/devkit/stargazers)

[English](README.md) · [Português](README.pt-BR.md)

</div>

---

![devKit home](docs/screenshots/home.png)

## ✨ Why devKit?

- **Private by design** – generation and validation run locally in the browser.
- **30+ tools in one place**, organized by category, with history and one-click copy.
- **Multilingual** – Portuguese, English and Spanish (next-intl).
- **Dark mode**, responsive layout, keyboard friendly.
- **REST API** for the main generators (`/api/v1/*`, OpenAPI at `/api/openapi`).
- **Zero required config** – every integration (analytics, ads, auth, contact) is optional and off by default.

## 🛠️ Tools

| Category | Tools |
|---|---|
| **Test data (Brazil)** | Fake person generator, CPF generator & validator, CNPJ generator & validator, RG generator |
| **Generators** | UUID, strong passwords, test e-mail addresses |
| **Codes** | Barcode generator (CODE128, EAN…), boleto digitable line converter, QR Code (URL, Wi-Fi, WhatsApp…), dynamic QR Code, OCR (image/PDF to text) |
| **International** | IBAN, SSN (US) and EU VAT generators/validators |
| **Dev & security** | cURL runner, JSON formatter/validator, Base64 text & file encoder, JWT decode/verify/sign (HS256), HTTP status codes reference, image EXIF metadata viewer/remover |
| **Productivity** | Pomodoro timer with sounds |
| **Math** | Roman numerals, prime factorization, GCD, LCM, rule of three, division remainder |

## 📸 Screenshots

| CPF generator | QR Code | JWT |
|---|---|---|
| ![CPF](docs/screenshots/cpf.png) | ![QR Code](docs/screenshots/qr-code.png) | ![JWT](docs/screenshots/jwt.png) |

## 🚀 Quick start

Requirements: **Node.js 20+** and npm.

```bash
git clone https://github.com/orlandoneto/devkit.git
cd devkit
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Optional settings live in [`.env.example`](.env.example). Copy it to `.env.local` and fill only what you need — with everything empty, devKit runs without ads, analytics, auth or contact form.

## 🗂️ Project structure

```
src/
  app/[locale]/     # one folder per tool page (cpf, jwt, qr-code, ...)
  app/api/v1/       # REST endpoints
  components/       # UI per tool + shared layout/ui
  lib/              # pure logic per tool (generators, validators) + tools.ts catalog
  store/            # zustand stores (history, theme)
messages/           # translations: pt.json, en.json, es.json
public/             # static assets
```

## ➕ Adding a new tool

1. Put the pure logic in `src/lib/<tool>/index.ts` (add tests when possible).
2. Create the UI in `src/components/<tool>/`.
3. Add the page at `src/app/[locale]/<tool>/page.tsx`.
4. Register it in `src/lib/tools.ts` (and `src/lib/home.ts` for the home catalog).
5. Add the texts to `messages/pt.json`, `en.json` and `es.json`.
6. Run `npm run lint && npm run build` and open a PR.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 🤝 Contributing

Contributions are very welcome: new tools, translations, bug fixes, docs. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md). Security issues: see [SECURITY.md](SECURITY.md).

If devKit helps you, **leave a ⭐** — it really helps the project grow.

## 📄 License

devKit is licensed under the **[GNU General Public License v3.0](LICENSE)** (GPL-3.0-only).

In plain words — the same idea as Linux:

- ✅ You can **use** it for free, for any purpose, including commercially.
- ✅ You can **study and modify** the code.
- ✅ You can **share** copies.
- ⚠️ If you **distribute** a modified version, it must stay under **GPL-3.0**, you must **publish the source code** of your changes and keep the copyright and license notices.

## 👤 Author

Created and maintained by **José Orlando Neto** — [@orlandoneto](https://github.com/orlandoneto).

Copyright © 2026 José Orlando Neto.
