import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  globalIgnores(["**/dist/", "**/src-tauri/"]),
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

  // 👇 Add this override
  {
    rules: {
      "react/react-in-jsx-scope": "off", // React 17+ no longer requires import React
    },
  },
]);
