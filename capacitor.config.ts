import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'gns_mobile_merchant',
  webDir: 'www',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
    }
  }
};

export default config;
