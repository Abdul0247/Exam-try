// vite.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
var vite_config_default = defineConfig({
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()]
  }
});
export {
  vite_config_default as default
};
