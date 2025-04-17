import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: __dirname,
  base: "/.integration/", // 👈 this is the key!
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "../dist/ui"),
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
});
