import { defineConfig } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config(); // ❤️ Now Vercel/Render envs are loaded

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/node-build.ts"),
      name: "server",
      fileName: "production",
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        "fs",
        "path",
        "url",
        "http",
        "https",
        "os",
        "crypto",
        "stream",
        "util",
        "events",
        "buffer",
        "querystring",
        "child_process",
        "express",
        "cors",
      ],
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
      },
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },

  // ❤️ FIX: Push VITE_API_URL into SSR bundle
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
  },
});
