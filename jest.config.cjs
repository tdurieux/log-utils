/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
  moduleNameMapper: {
    // see: https://github.com/kulshekhar/ts-jest/issues/414#issuecomment-517944368
    "^@/(.*)$": "<rootDir>/lib/$1",
  },
  preset: "ts-jest/presets/default-esm",
  collectCoverageFrom: ["src/**/*.ts"],
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!ansi-regex)"],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: {
        allowJs: true,
      },
    },
  },
  moduleFileExtensions: ["json", "js", "jsx", "ts", "tsx", "vue", "cjs"],
  moduleDirectories: ["node_modules"],
  roots: ["<rootDir>"],
  rootDir: "./",
  modulePaths: ["<rootDir>"],
};
