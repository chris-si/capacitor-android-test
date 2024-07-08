import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "ionic-vite-typeorm-migration",
  webDir: "dist",
  loggingBehavior: "production",
  server: {
    hostname: "mobile.start.ionic.io",
    // iosScheme: 'capacitor',
    // androidScheme: 'https',
  },
  android: {
    appendUserAgent: " x-custom-mua=android",
  },
  ios: {
    appendUserAgent: " x-custom-mua=ios",
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/CapacitorDatabase",
      iosIsEncryption: false,
      iosKeychainPrefix: "myDb",
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for capacitor sqlite",
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for capacitor sqlite",
        biometricSubTitle: "Log in using your biometric",
      },
    },
  },
};

export default config;
