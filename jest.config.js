/** @type {import("ts-jest").JestConfigWithTsJest} **/

// ignore modules
const esModules = ['@songbaek/fifo-map'].join('|');

console.log('Config loaded', esModules, 'ignore pattern', `/node_modules/(?!(${esModules})/)`);

module.exports = {
  preset: "ts-jest/presets/js-with-babel",
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts"
  ],
  coverageReporters: ["lcov", "html"],
  roots: [
    "<rootDir>/src/"
  ],
  setupFiles: [
    "<rootDir>/setupJest.js"
  ],
  testEnvironment: "jsdom",
  transform: {
    "^.+.ts?$": ["ts-jest", { useESM: true }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // fix for ESM imports in TypeScript
  },
  transformIgnorePatterns: [`/node_modules/(?!(${esModules})/)`]
};