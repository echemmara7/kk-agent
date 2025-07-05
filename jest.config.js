module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom", "./jest.setup.js"],
  testMatch: ["**/tests/**/*.test.tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        babelConfig: true,
        useESM: true
      }
    ]
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};
