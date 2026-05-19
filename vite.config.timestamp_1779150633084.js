// vite.config.ts
import { defineConfig } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
var vite_config_default = defineConfig({
  server: {
    preset: "vercel"
  },
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()]
  }
});
export {
  vite_config_default as default
};
