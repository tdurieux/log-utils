/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts"],
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!ansi-regex)"],
  globals: {
    "ts-jest": {
      tsconfig: {
        allowJs: true,
      },
    },
  },
};
