import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // GitHub Pages serves this repo from /accessible-design-system/, so built
  // asset URLs need that prefix. Only on build: the dev server stays at / so
  // http://localhost:5173 keeps working unchanged.
  base: command === "build" ? "/accessible-design-system/" : "/",

  server: { port: 5173 },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.js"],
  },
}));
