import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Privy + @solana/web3.js reference Node globals (Buffer/global/process)
    // that the browser lacks. Polyfill only what's needed.
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5178,
    host: true,
  },
});
