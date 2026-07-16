import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
  {
    name: 'Web Configuration (globals)',
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
