import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // Relative asset URLs, so the built dist/ folder works wherever it is dropped:
  // /design-system/, /work/10/playground/, a subfolder on any static host. The
  // app has no client-side routing, so there is no path for relative URLs to
  // break against. Dev stays at / so localhost:5173 is unchanged.
  base: command === "build" ? "./" : "/",

  server: { port: 5173 },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.js"],
  },
}));
