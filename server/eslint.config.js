import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      "no-relative-import-paths/no-relative-import-paths": "error",
    },
  },
]);
