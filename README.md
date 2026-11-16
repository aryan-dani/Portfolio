# Aryan Dani Portfolio

The source for [aryandani.com](https://www.aryandani.com/), an interactive developer portfolio built with React and Vite. The site combines a neo-brutalist visual system with project and experience pages, a command palette, a CLI playground, a Canvas technology globe, SEO metadata, and optional serverless features.

## Features

- Portfolio pages for projects, services, experience, skills, certifications, research, about, and contact
- Responsive light/dark themes, keyboard navigation, reduced-motion support, smooth scrolling, sound feedback, and installable PWA assets
- Lazy-loaded routes, Vite vendor chunking, image/asset caching, and Vercel Analytics
- GitHub profile statistics and public events with caching and graceful rate-limit handling
- Kuro chat assistant powered by Groq
- Contact form powered by Resend
- Guestbook backed by Upstash Redis
- Generated sitemap, SEO image assets, prerendered route shells, `robots.txt`, `humans.txt`, and `llms.txt`

## Tech stack

- React 18, React Router, Vite 5
- Framer Motion, Lenis, React Icons
- Tailwind CSS 4 tokens with CSS custom properties and Sass utilities
- Vite PWA plugin and Vercel Analytics
- Vercel-style API handlers in `frontend/api`

## Repository layout

```text
.
├── frontend/
│   ├── api/              Serverless handlers and shared API utilities
│   ├── public/           Static assets, PDFs, SEO files, and generated assets
│   ├── scripts/          Sitemap, SEO, prerender, IndexNow, and local API tooling
│   └── src/
│       ├── components/   Reusable interface components
│       ├── config/       Route and SEO configuration
│       ├── context/      Theme, toast, sound, and scroll providers
│       ├── data/         Portfolio content
│       ├── hooks/        Reusable React hooks
│       ├── pages/        Route-level page components
│       └── utils/        Motion, paths, icons, and API helpers
├── .github/workflows/    GitHub Pages build and deployment workflow
└── package.json          Root shortcuts for common frontend commands
```

## Requirements

- Node.js 20 or newer
- npm

Install dependencies from the frontend package, which is the directory containing the lockfile:

```sh
cd frontend
npm ci
```

## Local development

From the repository root:

```sh
npm run dev
```

Or from `frontend/`:

```sh
npm run dev
```

The Vite server opens at `http://localhost:3000`. During `vite`, the local API plugin serves the handlers in `frontend/api` at `/api/*`, so no separate API process is required.

Copy `frontend/.env.example` to `frontend/.env.local` when enabling integrations. Never commit `.env.local` or place secrets in `VITE_*` variables; Vite exposes `VITE_*` values to browser code.

### Optional integrations

| Integration | Environment variables | Used by |
| --- | --- | --- |
| Groq Kuro assistant | `GROQ_API_KEY`, optional `GROQ_MODEL`, `GROQ_FALLBACK_MODEL` | `/api/chat` |
| Resend contact delivery | `RESEND_API_KEY`, optional `CONTACT_FROM_EMAIL` | `/api/contact` |
| Upstash Redis | `UPSTASH_REDIS_REST_KV_REST_API_URL`, `UPSTASH_REDIS_REST_KV_REST_API_TOKEN`, optional read-only token | Guestbook, rate limits, and GitHub cache |
| GitHub API | optional `GITHUB_TOKEN` (or `GITHUB_PAT`) | GitHub stats and events |
| Vite HMR forwarding | optional `VITE_HMR_CLIENT_PORT` | Proxied/forwarded dev environments |

Without optional credentials, the frontend still builds. GitHub data falls back to unauthenticated requests and in-memory caching; guestbook writes and the contact/chat integrations require their backing services.

## API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/chat` | `POST` | Generate a Kuro assistant response |
| `/api/contact` | `POST` | Validate and deliver a contact message through Resend |
| `/api/guestbook` | `GET`, `POST`, `DELETE` | Read, add, or remove guestbook entries |
| `/api/github-stats` | `GET` | Load cached GitHub profile and repository statistics |
| `/api/github-events` | `GET` | Load recent public GitHub events |
| `/api/frame-check` | `GET` | Check whether a URL can be embedded |

The production API handlers are designed for Vercel-style serverless deployment. The GitHub Pages workflow publishes the static build only; deploy API-backed features to a platform that runs the handlers and configure the same environment variables there.

## Commands

Run these from the repository root:

```sh
npm run dev             # Start the local Vite server
npm run build           # Generate SEO assets, build, and prerender the site
npm run preview         # Preview the production build
npm run lint            # Run ESLint with warnings treated as errors
npm run indexnow        # Notify IndexNow after a production deployment
```

Equivalent commands are available inside `frontend/`. Additional frontend scripts include `generate:sitemap`, `generate:seo`, and `start` (Vite preview).

The build pipeline runs:

1. `generate-sitemap.mjs` before Vite builds
2. `generate-seo-assets.mjs` before the production bundle
3. `vite build`
4. `prerender-seo.mjs`
5. `ping-indexnow.mjs` after the build

IndexNow is skipped for preview builds and is safe to run locally without Vercel deployment context.

## Deployment

`.github/workflows/deploy.yml` runs on pushes to `main` and can also be started manually. It uses Node.js 20, runs `npm ci` in `frontend/`, builds `frontend/dist`, and deploys that directory to GitHub Pages. The workflow can optionally ping IndexNow after deployment.

For API-backed production behavior, deploy the frontend and `frontend/api` handlers to Vercel (or another compatible serverless platform), then configure the integration variables in that platform’s environment settings. The committed `frontend/vercel.json` contains redirects, security headers, cache policy, and SPA rewrites.

## Keyboard shortcuts

- `Ctrl+K`, `Meta+K`, or `Alt+K`: open the command palette
- `Alt+1` through `Alt+7`: jump between primary pages
- `?`: open the shortcut guide
- `Tab`: autocomplete commands in the CLI playground
- `Esc`: close overlays

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request. Pull requests should use the repository’s [pull request template](.github/PULL_REQUEST_TEMPLATE.md), and changes should pass `npm run lint` and `npm run build` when applicable.

## License and contact

Distributed under the [MIT License](LICENSE).

- Email: [daniaryan212@gmail.com](mailto:daniaryan212@gmail.com)
- LinkedIn: [Aryan Dani](https://www.linkedin.com/in/aryandani/)
- GitHub: [@aryan-dani](https://github.com/aryan-dani)
