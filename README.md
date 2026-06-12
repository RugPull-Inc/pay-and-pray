# Pay and Pray

Portfolio tracker for US-listed stocks.

Integrates SEC EDGAR for financial data and Yahoo Finance for market prices.

## Stack

| Layer        | Tech                           |
| ------------ | ------------------------------ |
| Web Frontend | Vite + React                   |
| Mobile App   | Capacitor + Android            |
| Backend API  | Kotlin + Spring Boot (Java 21) |
| Database     | PostgreSQL 16                  |

## Setup

1. **Clone the repo**

```bash
   git clone https://github.com/RugPull-Inc/pay-and-pray.git
   cd pay-and-pray
```

1. **Setup your** `.env` file (see `.env.example`)

```bash
   cp .env.example .env
```

1. **Activate git hooks**

```bash
   ./git-hooks/init
```

1. **Start the stack**

```bash
   docker compose up -d
```

## Services

| Service      | URL                                            |
| ------------ | ---------------------------------------------- |
| Web Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API  | [http://localhost:8080](http://localhost:8080) |
| Database     | localhost:5432                                 |

## Useful commands

```bash
# local dev (hot reload)
cd backend && ./gradlew bootRun         # run backend API locally
cd frontend && npm run dev              # run web frontend locally

# individual services
docker compose up -d db                 # start only the database
docker compose up -d backend            # start only the backend API
docker compose up -d frontend           # start only the web frontend

# stack
docker compose up -d                    # start everything
docker compose down                     # stop everything
docker compose down -v                  # stop everything and wipe database

# logs
docker compose logs -f backend          # tail backend API logs
docker compose logs -f frontend         # tail web frontend logs

# linting and formatting backend API
cd backend
./gradlew ktlintCheck        # check for issues
./gradlew ktlintFormat       # fix automatically

# linting and formatting web frontend
cd frontend
npm run format               # fix formatting automatically
npm run format:check         # check only (what CI runs)
npm run lint                 # check linting
npm run lint:fix             # fix linting automatically
```

## Android app

The mobile app uses Capacitor from the Vite frontend. The Android native project lives in `frontend/android`, which is the standard Capacitor layout because it syncs the built web app from `frontend/dist`.

Prerequisites:

- Android Studio
- Android SDK
- Android Emulator, or a physical Android device with USB debugging enabled

Run from `frontend`:

```bash
npm run mobile:build         # build Vite app and sync Capacitor
npm run cap:open:android     # open the Android project in Android Studio
```

You can also run directly:

```bash
npm run mobile:android
```

For the Android emulator, the backend URL must use the host-machine alias instead of `localhost`:

```bash
VITE_API_URL=http://10.0.2.2:8080
```