module.exports = {
  extends: ['../configs/.eslintrc.base.cjs'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Allow any type for route parameter extraction
    '@typescript-eslint/no-explicit-any': 'off',
    
    // Allow unused variables in some helper functions
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
