import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// Producción (terappia.es) muestra solo «Muy pronto» hasta el lanzamiento.
// La web y el área privada completas se ven en las versiones de prueba
// (cualquier rama que no sea main) y en local. Para abrir producción, añadir
// en Vercel la variable TERAPPIA_PUBLICA=1 (entorno Production) y redesplegar.
const prelaunch = process.env.VERCEL_ENV === "production" && process.env.TERAPPIA_PUBLICA !== "1";

export default defineConfig({
  define: { __PRELAUNCH__: JSON.stringify(prelaunch) },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  // NEXT_PUBLIC_ es el prefijo que usa la integración Supabase ↔ Vercel para
  // las claves públicas; así funcionan sin renombrarlas.
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
});
