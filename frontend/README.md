# Frontend

This directory contains the React and TypeScript frontend for the production platform.

The frontend is built with Vite. It runs locally during development and produces static production files that can later be deployed through Cloudflare Pages.

## Requirements

* Node.js
* npm

## Install dependencies

Run this command from the `frontend/` directory:

```bash
npm install
```

## Run locally

Run this command from the `frontend/` directory:

```bash
npm run dev
```

Vite will start a local development server and print the local URL in the terminal.

## Lint

Run this command from the `frontend/` directory:

```bash
npm run lint
```

This checks the frontend source for lint errors.

## Build

Run this command from the `frontend/` directory:

```bash
npm run build
```

This creates the production build output in:

```text
dist/
```

## Preview the production build locally

Run this command from the `frontend/` directory after building:

```bash
npm run preview
```

This serves the built files locally so the production build can be checked before deployment.

## Notes

The following generated or local-only files should not be committed:

* `node_modules/`
* `dist/`
* local environment files such as `.env`

## Deployment

The frontend is deployed with Cloudflare Pages.

Cloudflare Pages builds the React frontend from the GitHub repository and serves the production build output over HTTPS.

Live URLs:

* Custom domain: `https://portfolio.jonhuchins.dev`
* Cloudflare Pages URL: `https://my-platform-9ev.pages.dev/`

Cloudflare Pages configuration:

* Production branch: `main`
* Root directory: `frontend`
* Framework preset: React / Vite
* Build command: `npm run build`
* Build output directory: `dist`

Deployment verification:

* The Cloudflare Pages deployment completed successfully.
* The Cloudflare Pages URL loads over HTTPS.
* The custom domain loads over HTTPS, or is documented as pending.
* The deployed site shows the expected React application.

Current limitations:

* The frontend is deployed.
* The backend is not deployed yet.
* The production database connection is not configured yet.
