import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/ar.photo/",
  plugins: [react()],
  optimizeDeps: {
    // MindAR's source entry points contain Vite worker queries. They must stay
    // in Vite's normal transform pipeline instead of Rolldown pre-bundling.
    exclude: ["mind-ar", "mind-ar/src/image-target/compiler.js", "mind-ar/dist/mindar-image-three.prod.js"],
  },
  build: {
    chunkSizeWarningLimit: 1500,
    manifest: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-supabase",
              test: /node_modules[\\/]@supabase[\\/]/,
              priority: 3,
            },
            {
              name: "vendor-react",
              test: /node_modules[\\/](?:react|react-dom|react-router|@tanstack)[\\/]/,
              priority: 2,
            },
          ],
        },
      },
    },
  },
});
