import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const defaultApkPath = path.join(
  frontendRoot,
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'debug',
  'app-debug.apk'
)

const appiumPort = Number(process.env.APPIUM_PORT ?? 4723)
const appiumHost = process.env.APPIUM_HOST ?? '127.0.0.1'
const appPath = process.env.APPIUM_ANDROID_APP ?? defaultApkPath
const deviceName = process.env.APPIUM_ANDROID_DEVICE_NAME ?? 'Android Emulator'
const platformVersion = process.env.APPIUM_ANDROID_PLATFORM_VERSION

export const config = {
  runner: 'local',
  specs: [path.join(__dirname, 'specs', '**', '*.e2e.mjs')],
  maxInstances: 1,
  hostname: appiumHost,
  port: appiumPort,
  path: '/',
  logLevel: process.env.WDIO_LOG_LEVEL ?? 'warn',
  bail: 0,
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 1,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          address: appiumHost,
          port: appiumPort,
          basePath: '/',
        },
      },
    ],
  ],
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': deviceName,
      'appium:app': appPath,
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 120,
      'appium:adbExecTimeout': 120000,
      'appium:androidInstallTimeout': 120000,
      'appium:uiautomator2ServerInstallTimeout': 120000,
      'appium:uiautomator2ServerLaunchTimeout': 120000,
      ...(platformVersion ? { 'appium:platformVersion': platformVersion } : {}),
    },
  ],
}
