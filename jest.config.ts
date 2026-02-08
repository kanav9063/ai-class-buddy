import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "node",
      testEnvironment: "node",
      preset: "ts-jest",
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      transform: { "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }] },
      testMatch: [
        "<rootDir>/__tests__/api/**/*.test.ts",
        "<rootDir>/__tests__/lib/**/*.test.ts",
      ],
    },
    {
      displayName: "jsdom",
      testEnvironment: "jest-environment-jsdom",
      preset: "ts-jest",
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
      transform: {
        "^.+\\.tsx?$": ["ts-jest", {
          tsconfig: {
            jsx: "react-jsx",
            module: "esnext",
            moduleResolution: "bundler",
            esModuleInterop: true,
            paths: { "@/*": ["./src/*"] },
          },
        }],
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      testMatch: ["<rootDir>/__tests__/components/**/*.test.tsx"],
    },
  ],
};

export default config;
