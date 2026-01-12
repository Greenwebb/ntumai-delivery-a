// Load environment variables with proper priority (system > .env)
import type { ExpoConfig } from "expo/config";

// Google Maps API Key (also exported in config/api-keys.ts for app components)
const GOOGLE_MAPS_API_KEY = 'AIzaSyDw59gPssVHEg1TcHoC9at1KDF98yVnQe4';

// Bundle ID format: space.ntumai.<project_name_dots>.<timestamp>
// e.g., "my-app" created at 2024-01-15 10:30:45 -> "space.ntumai.my.app.t20240115103045"
const bundleId = "com.ntumai.app";
// Extract timestamp from bundle ID and prefix with "ntumai" for deep link scheme
// e.g., "space.ntumai.my.app.t20240115103045" -> "ntumai20240115103045"
const schemeFromBundleId = "ntumaidelivery";

const env = {
  // App branding - update these values directly (do not use env vars)
  appName: "Ntumai Delivery",
  appSlug: "ntumai-delivery",
  // S3 URL of the app logo - set this to the URL returned by generate_image when creating custom logo
  // Leave empty to use the default icon from assets/images/icon.png
  logoUrl: "",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    config: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: ["POST_NOTIFICATIONS"],
    googleServicesFile: "./google-services.json",
    config: {
      googleMaps: {
        apiKey: GOOGLE_MAPS_API_KEY,
      },
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-asset",
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
        },
      },
    ],
    [
      "@react-native-firebase/app",
      {
        android: {
          googleServicesFile: "./google-services.json",
        },
      },
    ],
    [
      "expo-maps",
      {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "63c57218-b1fb-476d-b9ad-1944cb86b51d",
    },
  },
  owner: "georgemunganga",
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
