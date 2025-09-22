import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      'playwright-report/**',
      'playwright-report-evidence/**',
      '.next/**',
      'coverage/**',
      'dist/**',
      'test-results/**',
      'out/**',
      'node_modules/**',
      'src/generated/**',
      'src/lib/contracts/**',
      'src/__generated__/**',
      '**/*.config.js',
      '**/*.config.cjs',
      '.eslintrc.cjs',
      '**/*-[A-Z0-9]*.js',
      '**/trace/**',
      '**/assets/**/*.js',
      '**/*-evidence/**',
      '**/*.chromium-*',
      '**/report*/**/*.js',
      '**/codeMirrorModule-*.js',
      '**/trace/assets/**'
    ]
  },
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    '@typescript-eslint/recommended-type-checked',
    'prettier'
  ),
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      // TypeScript strict mode rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 5
        }
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      
      // React best practices
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-key': 'error',
      
      // General code quality
      'no-console': ['warn', { 'allow': ['info', 'warn'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Import organization
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '@components/**',
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '@lib/**',
              group: 'internal',
              position: 'before'
            },
            {
              pattern: '@tests/**',
              group: 'internal',
              position: 'before'
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin']
        }
      ]
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      // Allow CommonJS require in .cjs files
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx', '**/*.spec.ts', '**/*.test.ts'],
    rules: {
      // Relax some rules for test files
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
];

export default eslintConfig;