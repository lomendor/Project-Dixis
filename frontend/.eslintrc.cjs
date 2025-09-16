const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
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
      'no-console': 'warn',
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
    files: ['tests/**/*.ts', 'tests/**/*.tsx', '**/*.spec.ts', '**/*.test.ts'],
    rules: {
      // Relax some rules for test files
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
];