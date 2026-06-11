import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.pokerpoints.mobile',
  appName: 'Poker Points',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
