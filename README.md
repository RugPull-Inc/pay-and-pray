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
- Java 17 or 21 available on `PATH` for the Android Gradle build. Do not use newer JDKs such as Java 25 for Android builds.

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

## Mobile E2E tests with Appium

Mobile E2E tests run the Capacitor Android app with Appium and the UiAutomator2 driver.

Prerequisites:

- Android Studio with an Android Virtual Device configured
- Android SDK tools on `PATH` (`adb`, `emulator`)
- `JAVA_HOME` pointing to JDK 17 or 21 for the Android Gradle build
- Appium dependencies installed with `npm install` from `frontend`

Install or verify the Appium Android driver from `frontend`:

```bash
cd frontend
npm run appium:driver:install   # first time only
npm run appium:driver:list      # should show uiautomator2
```

If the install command says `uiautomator2` is already installed, continue with `npm run appium:driver:list`.

Start an emulator before running the tests. You can use Android Studio's Device Manager, or the command line:

```bash
emulator -list-avds
emulator -avd <AVD_NAME>
adb devices
```

Build the app and run the Android tests:

```bash
cd frontend
npm run appium:test:android
```

The test command uses the WebdriverIO testrunner and starts Appium through `@wdio/appium-service`. You only need `npm run appium:server` when you want to run Appium manually for debugging or Appium Inspector.

If Appium reports that the UiAutomator2 instrumentation cannot be initialized, confirm the emulator is fully booted and visible as `device` in `adb devices`. The WDIO config already increases the Android install, ADB, and UiAutomator2 launch timeouts for slower local emulators.

Useful overrides:

```bash
# choose a specific device name reported by adb/emulator
APPIUM_ANDROID_DEVICE_NAME="Pixel_7_API_35" npm run appium:test:android

# reuse a prebuilt APK instead of the default android/app/build/outputs/apk/debug/app-debug.apk
APPIUM_ANDROID_APP="/path/to/app-debug.apk" npm run appium:test:android

# point to a non-default Appium server
APPIUM_HOST=127.0.0.1 APPIUM_PORT=4723 npm run appium:test:android
```
