import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    modulePreload: {
      polyfill: false,
    },
  },
  plugins: [
    ...tanstackStart(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});