import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), legacy()],
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      mangle: {
        reserved: [
          // Typeorm migration functions
          "up",
          "down",
          // Migrations
          "AddTables1679564893341",
        ],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
