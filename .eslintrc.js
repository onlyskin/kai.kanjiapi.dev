module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es6': true,
        'node': true
    },
    'extends': [
      'eslint:recommended',
      'plugin:prettier/recommended',
      'prettier'
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018
    },
    'plugins': [ 'prettier' ],
    'rules': {
        'prettier/prettier': ['error'],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'semi': [
            'error',
            'never'
        ],
        'comma-dangle': [
            'error',
            'always-multiline'
        ],
    }
};
