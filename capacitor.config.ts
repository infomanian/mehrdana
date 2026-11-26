import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Android shell for the MehrDana web app.
 *
 * The app loads the deployed site over `server.url`, so every future web
 * update appears in the app automatically without publishing a new APK. The
 * bundled `webDir` is only a tiny offline placeholder, never a static export.
 */
const config: CapacitorConfig = {
  appId: "ir.mehrdana.app",
  appName: "مهر دانا",
  webDir: "capacitor-fallback",
  server: {
    url: "https://mehrdana-src.vercel.app/profile",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
