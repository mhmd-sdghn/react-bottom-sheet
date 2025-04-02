import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";

export default defineConfig({
  resolve: {
    alias: {
      "@": "./src",
      "@lib": "./lib",
      "@examples": "./examples",
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["lib"],
    }),
    react(),
  ],
});
