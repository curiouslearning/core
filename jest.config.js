/** @type {import("ts-jest").JestConfigWithTsJest} **/

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
    "^.+.ts?$": ["ts-jest"],
    "^.+\\.(js|jsx|mjs)$": "babel-jest"
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // fix for ESM imports in TypeScript
  },
  transformIgnorePatterns: [
  ]
};