import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  base: '/.integration/',
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, '../dist/ui'),
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  }
});
