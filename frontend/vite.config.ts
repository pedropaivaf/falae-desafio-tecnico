import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Evita configurar CORS no backend: o navegador chama /api no próprio
      // frontend, e o Vite repassa pra API real rodando na porta 3333.
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
    },
  },
});
