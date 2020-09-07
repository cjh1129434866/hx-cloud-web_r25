module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/typescript/recommended', '@vue/prettier', '@vue/prettier/@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020
  },
  globals: {
    AMap: true,
    Messaging: true,
    ActiveXObject: true,
    EZUIKit: true,
    EZUIPlayer: true,
    TimeLine: true
  },
  rules: {
    'no-console': 'off', // process.env.NODE_ENV === 'production' ? ['error', { allow: ['warn', 'error'] }] : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/interface-name-prefix': [0, { prefixWithI: 'always' }],
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: false
      }
    ],
    '@typescript-eslint/no-explicit-any': 0,
    // 为了编译通过，暂时先关闭以下规则
    '@typescript-eslint/camelcase': 0
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        mocha: true
      }
    }
  ]
}
