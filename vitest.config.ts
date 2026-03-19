import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./test/setup.ts",
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: [
        "src/lib/utils.ts",
        "src/lib/pdfService.ts", 
        "src/lib/logger.ts",
        "src/lib/audit.ts",
        "src/context/UIContext.tsx",
        "src/context/AppContext.tsx"
      ],
      exclude: ["src/**/*.test.{ts,tsx}", "src/types/**/*", "src/components/**/*", "src/config/**/*", "src/data/**/*"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
