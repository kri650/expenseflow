import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is the tool that runs our React app during development
// (instant reload when you save a file) and bundles it for production.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
