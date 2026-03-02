/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/nodes', '<rootDir>/credentials'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'nodes/**/*.ts',
        'credentials/**/*.ts',
        '!**/__tests__/**',
        '!**/descriptions/**',
    ],
};
