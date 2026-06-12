# Mobile Spike

## Decision

We added Capacitor to the existing Vite + React frontend and generated the Android native project at `frontend/android`.

The app remains a single React codebase. The web build is produced into `frontend/dist`, then Capacitor syncs that build into the Android shell.

## Why

Capacitor fits this project because the frontend is already a browser-based React app and does not need a separate native UI implementation yet. This keeps product behavior, routing, API services, styling, and tests centered in one frontend codebase while still allowing native Android packaging.

Keeping `android/` inside `frontend/` is the default Capacitor structure and reduces path/configuration complexity. A separate root-level `mobile/` package would require extra wiring to consume the frontend build output and would duplicate project boundaries without giving much benefit right now.

## What Was Added

- `@capacitor/core`
- `@capacitor/android`
- `@capacitor/cli`
- `frontend/capacitor.config.ts`
- `frontend/android/`
- npm scripts for build, sync, open, and run

## Commands

From `frontend`:

```bash
npm run mobile:build
npm run cap:open:android
```

Direct Android run:

```bash
npm run mobile:android
```

## Backend URL Notes

Mobile builds cannot use `localhost` the same way the desktop browser does.

For Android emulator:

```bash
VITE_API_URL=http://10.0.2.2:8080
```

The backend CORS configuration must allow the Capacitor origin. With the current Capacitor config, that origin is normally:

```txt
https://localhost
```

## iOS Note

iOS support can be added later with `@capacitor/ios`, but building and running iOS requires macOS and Xcode. On Windows, the practical options are Android emulator/device testing or testing the web app from an iPhone browser over the local network.
