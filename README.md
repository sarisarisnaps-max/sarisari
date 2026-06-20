# SariSari Snaps — Configurator

Custom magnetic photo-frame order builder. **Made to keep.**

A customer chooses a frame, uploads photos, plays with the layout in a live
preview, personalizes it, and places an order. Built per the project brief
(`BUILD-BRIEF.md`).

## Status

**Phase 1 — UI on mock data.** The full 4-step flow + live preview + drag
sandbox run locally with no backend. Photos use in-browser object URLs; submit
is mocked. Phases 2–5 (Drive photo save, Apps Script order/email, Mailchimp,
Vercel deploy) wire in next.

## Stack

React + Vite + Tailwind + Zustand (state) + dnd-kit (drag sandbox). All free.

## Run locally

Requires Node 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## Deploy (Vercel)

1. Push this project to the GitHub repo.
2. In Vercel → **New Project** → import the repo. Framework auto-detects as
   **Vite** (build `npm run build`, output `dist`).
3. Deploy. Add env vars (below) in Vercel once the backend exists.

## Environment

Copy `.env.example` → `.env.local` and fill in. All values are client-safe.

| Var | Meaning |
|---|---|
| `VITE_APPS_SCRIPT_URL` | Apps Script Web App URL (Phases 2–3). Empty = mock mode. |
| `VITE_DRIVE_PARENT_FOLDER` | Drive folder for saved photos. |

> 🔐 The **Mailchimp API key is a server secret** — it lives in the Google Apps
> Script backend only, **never** in this front-end. Local secrets are kept in
> `SECRETS.local.md`, which is gitignored. Never commit it (the repo is public).

## Customize

- **Frame colours / hex** → `src/config/colors.js` (one array — a one-line swap).
- **SKUs / grids / prices** → `src/config/skus.js`.
- **Stamp glyphs** → `src/config/icons.js`.

## Structure

```
src/
  config/   skus.js · colors.js · icons.js · app.js (env + helpers)
  store/    useOrderStore.js (Zustand: state + pricing + payload)
  components/
    Stepper · StepChooseFrame · StepPickColor · StepAddDetails · StepReview
    FramePreview · PhotoGrid (dnd-kit) · PreviewPanel · Confirmation · StepNav
  App.jsx
```
