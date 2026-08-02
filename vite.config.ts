import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/ar.photo/",
  plugins: [react()],
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
