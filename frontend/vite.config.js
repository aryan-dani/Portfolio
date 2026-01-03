import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Portfolio/",
  publicDir: "public",
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "./src/styles/_variables.scss" as *;`,
      },
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
