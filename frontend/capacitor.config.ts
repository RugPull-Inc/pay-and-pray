import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.payandpray.app',
  appName: 'Pay and Pray',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
  },
}

export default config
