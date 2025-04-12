// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const LibraryName = "react-bottom-sheet";

export default defineConfig({
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./lib"),
    },
  },
  plugins: [react()],
  build: {
    lib: {
      name: "react-bottom-sheet",
      entry: path.resolve(__dirname, "lib/index.ts"),
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@emotion/react",
        "@react-spring/web",
        "@use-gesture/react",
        "react/jsx-runtime",
      ],
      output: [
        {
          interop: "auto",
          format: "es",
          preserveModules: true,
          preserveModulesRoot: "lib",
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          inlineDynamicImports: false,
          exports: "named",
        },
        {
          name: LibraryName,
          interop: "auto",
          format: "umd",
          inlineDynamicImports: true,
          entryFileNames: "index.umd.js",
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "jsxRuntime",
            "@react-spring/web": "ReactSpringWeb",
            "@use-gesture/react": "ReactGesture",
          },
        },
      ],
    },
  },
});
