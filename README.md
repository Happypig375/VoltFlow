# VoltFlow

VoltFlow is an EV charging planner and session tracker built with React + Vite.
Backend services are Firebase Authentication + Firestore.

## Requirements

- Node.js 20+
- npm
- A Firebase project

## One-Time Firebase Setup

1. In Firebase Console, create/select your project.
2. Enable Authentication -> Sign-in method -> Email/Password.
3. Create Firestore Database.
4. Create a Web App and copy its config values.

## Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. Create app env file:

```bash
cp .env.example .env.local
```

3. Fill `.env.local` with your Firebase web config.

4. Start dev server:

```bash
npm run dev
```

5. Open the Vite URL (usually `http://localhost:5173`).

## Firebase CLI Setup (for rules deploy)

The Firebase CLI is installed locally in this project (no global install required).

1. Login:

```bash
npm run firebase:login
```

2. Deploy Firestore rules:

```bash
npm run firestore:rules:deploy
```

Notes:
- Rules deploy target is controlled by Firebase CLI config, not `.env.local`.
- This repository uses `.firebaserc` as the single source of truth for deploy target.
- Current default project is `voltflow-3c40d` (`projects.default` in `.firebaserc`).
- `.env.local` is used by the web app at runtime (`VITE_FIREBASE_*`) and does not set Firebase CLI deploy target.

## Seed Sample Charger Data

### Option A: Shell env var

1. Download Firebase service account JSON key.
2. Export its absolute path:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

3. Run seed script:

```bash
npm run seed:chargers
```

### Option B: Local seed env file (recommended)

1. Create local seed env file:

```bash
cp .env.seed.example .env.seed.local
```

2. Edit `.env.seed.local` and set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of your service account JSON.

3. Run:

```bash
npm run seed:chargers:local
```

## Build and Preview (Web)

Build production bundle:

```bash
npm run build
```

Preview built app locally:

```bash
npm run preview
```

## Publish (Web)

### Vercel

- `vercel.json` includes SPA rewrite config.
- Deploy `dist` output from `npm run build`.

### Firebase Hosting

- `firebase.json` includes hosting + SPA rewrite config.
- If using Firebase Hosting CLI deploy, run build first.

## Mobile Build (Capacitor)

1. Build web assets:

```bash
npm run build
```

2. Sync Capacitor platform projects:

```bash
npm run cap:sync
```

3. Open native project:

```bash
npm run cap:open:ios
npm run cap:open:android
```

## Useful Commands

```bash
npm run lint
npm run lint:fix
npm run typecheck
```

## Troubleshooting

### `command not found: firebase`

Use local scripts instead of global CLI:

```bash
npm run firebase:login
npm run firestore:rules:deploy
```

### `OPERATION_NOT_ALLOWED` on signup

Enable Email/Password provider in Firebase Authentication.

### `Missing or insufficient permissions`

Deploy Firestore rules and ensure you are targeting the same Firebase project as your `.env.local` values.

### Firestore Listen/channel access-control errors

The app is configured to auto-detect long polling for restrictive networks/browsers.
If errors persist, test in another browser and confirm Firestore/API access is enabled in the same project.
