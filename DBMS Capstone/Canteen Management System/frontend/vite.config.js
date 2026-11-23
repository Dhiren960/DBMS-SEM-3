import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Requests to /api and /images are forwarded to the Express back end
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/images": "http://localhost:5000",
    },
  },
});
