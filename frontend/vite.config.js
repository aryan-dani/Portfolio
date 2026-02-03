import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
    // Enable CSS code splitting
    devSourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
    cssCodeSplit: true, // Split CSS into chunks
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: {
        safari10: true,
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
          // Particles in its own chunk (heavy)
          "vendor-particles": ["react-tsparticles", "tsparticles-slim"],
        },
      },
    },
    chunkSizeWarningLimit: 500, // Lower threshold to encourage smaller chunks
    // Reduce target for better tree-shaking
    target: "esnext",
    // Enable module preload polyfill
    modulePreload: {
      polyfill: true,
    },
  },
  // Optimize deps
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "framer-motion"],
  },
});
