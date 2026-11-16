# Contributing to Portfolio

Thanks for helping improve the portfolio. Small documentation fixes, reproducible bug reports, accessibility improvements, and focused UI or performance changes are welcome.

## Before you start

1. Read the [Code of Conduct](CODE_OF_CONDUCT.md).
2. Search existing [issues](https://github.com/aryan-dani/Portfolio/issues) and pull requests before opening a new one.
3. For code changes, install dependencies from `frontend/` with `npm ci`.
4. Never commit secrets, `.env.local`, generated build output, or personal credentials.

## Report a bug

Use the [bug report form](.github/ISSUE_TEMPLATE/bug_report.yml). Include:

- A concise title and the affected route or feature
- Reproduction steps and the expected and actual behavior
- Browser, operating system, and Node.js version when relevant
- Console/network errors, screenshots, and a minimal reproduction where possible
- Whether the issue occurs with optional integrations configured or unavailable

## Suggest an enhancement

Use the [feature request form](.github/ISSUE_TEMPLATE/feature_request.yml). Explain the problem, the proposed behavior, and why it fits the portfolio. Include route, accessibility, responsive, and performance considerations when applicable.

## Local workflow

```sh
npm ci --prefix frontend
npm run dev
npm run lint
npm run build
```

The Vite development server also mounts the handlers in `frontend/api` at `/api/*`. Copy `frontend/.env.example` to `frontend/.env.local` only when testing integrations; keep all secret values local or in deployment-provider environment settings.

## Pull requests

Use the repository’s [pull request template](.github/PULL_REQUEST_TEMPLATE.md). A good pull request:

- Solves one focused problem and explains the motivation
- Updates directly related documentation and content
- Preserves keyboard, mobile, reduced-motion, and light/dark behavior
- Includes relevant validation commands and their results
- Avoids unrelated formatting or dependency changes

Before requesting review, run the smallest applicable checks. For frontend behavior or build changes, run both `npm run lint` and `npm run build` from the repository root. If a check cannot be run, explain why in the pull request.

## Style

- Follow the existing React, JavaScript, CSS, and file-organization patterns.
- Use clear names and keep comments for non-obvious decisions.
- Keep commit subjects imperative and concise, ideally 72 characters or fewer.
- Keep generated SEO files synchronized by using the existing scripts rather than editing generated output by hand.

Maintainers may request changes or decline contributions that do not meet the Code of Conduct, introduce security risks, expose secrets, or substantially expand the scope of the change.
