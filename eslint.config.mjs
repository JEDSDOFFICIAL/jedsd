import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow `any` type
      "@typescript-eslint/no-explicit-any": "off",

      // Allow unused variables (like unused imports)
      "@typescript-eslint/no-unused-vars": "off",

      // Disable missing hook dependency warnings
      "react-hooks/exhaustive-deps": "off",
      '@typescript-eslint/no-empty-interface': 'off', // if you still want empty interfaces
    '@typescript-eslint/no-unused-expressions': 'warn',
    'react-hooks/rules-of-hooks': 'error', // KEEP THIS
    },
  },
];

export default eslintConfig;
