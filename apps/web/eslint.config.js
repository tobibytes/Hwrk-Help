import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Prevent raw HTML usage in Areas components
  {
    files: ['**/Areas/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement[openingElement.name.name=/^(div|span|p|h1|h2|h3|h4|h5|h6|a|ul|ol|li|nav|section|article|header|footer|main|aside)$/]',
          message: 'Raw HTML elements are not allowed in Areas. Use Talvra UI primitives instead: Surface, Stack, Text, Link, etc.'
        }
      ]
    }
  }
])
