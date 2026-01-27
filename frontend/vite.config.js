import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  publicDir: "public",
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
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
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React core
          "vendor-react": ["react", "react-dom"],
          // Router in its own chunk
          "vendor-router": ["react-router-dom"],
          // Framer Motion is large, separate chunk
          "vendor-motion": ["framer-motion"],
          // Icons library
          "vendor-icons": ["react-icons"],
        },
      },
    },
    chunkSizeWarningLimit: 500, // Lower threshold to encourage smaller chunks
  },
});
