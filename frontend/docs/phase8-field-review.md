# Phase 8 — Field data review

## Lab budgets

Run local performance checks before / after visual or route changes:

- `npm run audit` — Lighthouse-style lab budgets
- `npm run audit:trace` — deeper trace / attribution when a budget regresses

## Funnel events

Instrument and verify these conversion events in production analytics:

| Event | Meaning |
| --- | --- |
| `action_click` | Primary CTA / action engagement |
| `brief_started` | Inquiry brief flow opened |
| `brief_sent` | Brief completed and sent |
| `inquiry_submitted` | Contact / services inquiry form submitted |

## Production RUM

Real-user metrics come from Vercel **Speed Insights** (enabled in production via `App.jsx`).

28-day field targets:

- **LCP** ≤ 2.5s
- **CLS** ≤ 0.1
- **INP** ≤ 200ms

## Test inquiry

End-to-end inquiry email delivery requires `RESEND_API_KEY` set on the Vercel project. Without it, `/api/contact` cannot send mail in production.

## LazyMotion note

`App.jsx` wraps the tree in `<LazyMotion features={domAnimation}>` (no `strict`) so existing `motion.*` usage keeps working while feature loading stays async. A follow-up can migrate to `m` + `strict` for stronger tree-shaking.
