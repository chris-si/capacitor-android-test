import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter.mobile",
  appName: "capacitor-android-test",
  webDir: "dist",
  loggingBehavior: "debug",
  server: {
    hostname: "mobile.start.ionic.io",
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
