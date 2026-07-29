const js = require('@eslint/js')
const globals = require('globals')
const prettierRecommended = require('eslint-plugin-prettier/recommended')

// Formatting rules (semi, comma-dangle, line endings) are deliberately absent:
// prettier owns those, and prettierRecommended reports its diffs as lint errors.
module.exports = [
  { ignores: ['out/'] },
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
]
