# Pay and Pray

Portfolio tracker for US-listed stocks.

Integrates SEC EDGAR for financial data and Yahoo Finance for market prices.

## Stack


| Layer        | Tech                           |
| ------------ | ------------------------------ |
| Web Frontend | Next.js (React)                |
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

