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
