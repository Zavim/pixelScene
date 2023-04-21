import { defineConfig } from "astro/config";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
import react from "@astrojs/react";

export default defineConfig({
  integrations: [
    react(),
    AstroPWA({
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "mask-icon.svg"],
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{ts,tsx,ico,png,svg}"],
      },
      strategies: "generateSW",
      manifest: {
        name: "Pixel Scene",
        short_name: "PixelScene",
        description: "A starter, pixel-rendered scene",
        theme_color: "#000000",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
