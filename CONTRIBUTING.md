# Contributing to devKit

Thanks for helping! 🎉 All kinds of contributions are welcome: new tools, bug fixes, translations, docs and ideas.

## Getting started

1. Fork the repo and clone your fork.
2. `npm install`
3. `npm run dev` and open http://localhost:3000
4. Create a branch: `git checkout -b feat/my-tool`

## Guidelines

- **Keep it client-side.** Tools must not send user input to a server unless strictly needed (and documented).
- **No real personal data.** Generators produce synthetic data for testing only.
- **Never commit secrets** (`.env*`, tokens, API keys, analytics/ads IDs). Use `.env.example` for new optional variables, always with empty values, and make the code work when they are unset.
- **i18n:** every visible text goes in `messages/pt.json`, `en.json` and `es.json`.
- **Logic in `src/lib`**, UI in `src/components`, page in `src/app/[locale]`. Register new tools in `src/lib/tools.ts`.
- Before opening a PR run: `npm run lint`, `npm test` and `npm run build`.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org): `feat: add color converter`, `fix(cpf): mask on paste`, `docs: ...`, `chore: ...`.

## Pull requests

- One topic per PR, with a clear description and screenshots for UI changes.
- Link the related issue (`Closes #123`).
- Be kind in reviews — see the [Code of Conduct](CODE_OF_CONDUCT.md).

## License of contributions

By contributing you agree that your contribution is licensed under the project's [GPL-3.0-only](LICENSE) license.
