import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import path from "path";

export default defineConfig({
  plugins: [solid({ dev: true })],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "solid-debugger",
    },
    rollupOptions: {
      external: ["solid-js"],
      output: [
        {
          dir: "dist",
          format: "cjs",
        },
        {
          dir: "dist",
          format: "es",
        },
      ],
    },
  },
});
