import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react()],
  base: "/Portfolio/",
  publicDir: "public",
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: (content, filename) => {
          // Don't inject into _variables.scss itself to avoid circular import
          if (filename.includes("_variables.scss")) return content;
          return `@import "${fileURLToPath(
            new URL("./src/styles/_variables.scss", import.meta.url)
          ).replace(/\\/g, "/")}";\n${content}`;
        },
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
