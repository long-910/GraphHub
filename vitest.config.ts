import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Expose vitest globals (describe/it/expect/vi) so @testing-library/jest-dom
    // setup can call expect.extend() before test files are loaded.
    globals: true,
    // Use jsdom for component tests; node for API route handler tests
    environment: "jsdom",
    environmentMatchGlobs: [["src/__tests__/api/**", "node"]],
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/__tests__/**",
        "src/types/**",
        "src/env.js",
      ],
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
