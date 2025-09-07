import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: __dirname, // <-- ensure Vite serves apps/web as root
  base: '/Lightning/',
  plugins: [
    react({ babel: { plugins: [["babel-plugin-react-compiler"]] } }),
    tsconfigPaths(),
    tailwindcss(),
  ],
  clearScreen: false,
  resolve: { dedupe: ["react", "react-dom"] },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    allowedHosts: [
      "bore.pub"
    ],
    fs: { allow: [path.resolve(__dirname, "../../")] },
  },
  publicDir: path.resolve(__dirname, "../../public"),
});
