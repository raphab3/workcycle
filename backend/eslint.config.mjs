import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import { globalIgnores } from 'eslint/config';

export default tseslint.config(
  globalIgnores(['dist/**', 'node_modules/**', 'drizzle.config.ts']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    },
  },
);