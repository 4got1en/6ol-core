module.exports = {
    root: true,
    env: { es2023: true, node: true, browser: true },
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2023
    },
    extends: ['eslint:recommended'],
    plugins: ['unused-imports', '@typescript-eslint'],
    rules: {
        'unused-imports/no-unused-imports': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-multiple-empty-lines': ['error', { max: 1 }],
        'max-len': ['error', { code: 100, ignoreUrls: true }]
    },
    ignorePatterns: ['.reports/**', 'coverage/**']
}
