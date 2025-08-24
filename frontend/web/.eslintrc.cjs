module.exports = {
  extends: ['../../packages/configs/.eslintrc.base.cjs'],
  env: {
    browser: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-hooks', 'react-refresh'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      // Prevent raw HTML tags in Areas - only allow Talvra UI primitives
      files: ['src/Areas/**/*.tsx', 'src/Areas/**/*.ts'],
      excludedFiles: ['src/Areas/**/components/**/*.tsx'], // Allow raw tags in area-specific components
      rules: {
        'react/forbid-elements': [
          'error',
          {
            forbid: [
              'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'button', 'a', 'img', 'input', 'form', 'section', 'article',
              'header', 'footer', 'nav', 'main', 'aside', 'ul', 'ol', 'li',
              'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot'
            ].map(tag => ({
              element: tag,
              message: `Use Talvra UI primitives instead of raw <${tag}> tags. Import from '@ui' package.`
            }))
          }
        ]
      }
    }
  ]
};
