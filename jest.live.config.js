/* eslint-disable @typescript-eslint/no-require-imports -- Jest config must be CommonJS */
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.live.test.ts'],
  testTimeout: 30000,
  moduleDirectories: ['node_modules', '<rootDir>'],
};

module.exports = createJestConfig(customJestConfig);
