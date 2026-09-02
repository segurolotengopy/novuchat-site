// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'functions/lib/**',
      'material-previo/**',
      'docs/diseno/**', // exportación del prototipo: referencia, no código nuestro
    ],
  },
  {
    // Scripts de mantenimiento: corren en Node, no en el navegador.
    files: ['scripts/**/*.mjs', '*.config.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  {
    rules: {
      // Prohibición 2 de CLAUDE.md: nada de ejecución dinámica ni de HTML crudo.
      // El CI las repite con `pnpm prohibiciones`, que además cubre los .astro.
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-properties': [
        'error',
        {
          property: 'innerHTML',
          message: 'Prohibido: use texto. Ver prohibición 2 de CLAUDE.md.',
        },
        {
          property: 'outerHTML',
          message: 'Prohibido: use texto. Ver prohibición 2 de CLAUDE.md.',
        },
        {
          property: 'dangerouslySetInnerHTML',
          message: 'Prohibido: use texto. Ver prohibición 2 de CLAUDE.md.',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
