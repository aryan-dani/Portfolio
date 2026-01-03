import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Portfolio/",
  publicDir: "public",
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          "legacy-js-api",
          "color-functions",
          "global-builtin",
          "import",
        ],
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
