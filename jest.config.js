/** @type {import('jest-expo/jest-preset').JestPreset} */
module.exports = {
  preset: "jest-expo",

  // Minimal suite — same idea as web `src/tests/**` (no feature-matrix / coverage gates)
  testMatch: ["<rootDir>/src/tests/**/*.test.[jt]s?(x)"],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  moduleNameMapper: {
    "^@store/(.*)$": "<rootDir>/src/appStore/$1",
    "^@constants$": "<rootDir>/src/constants/index.ts",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@appFeatures/(.*)$": "<rootDir>/src/features/app/$1",
    "^@navigation/(.*)$": "<rootDir>/src/features/navigation/$1",
    "^@home/(.*)$": "<rootDir>/src/features/home/$1",
    "^@ashram/(.*)$": "<rootDir>/src/features/ashram/$1",
    "^@satsang/(.*)$": "<rootDir>/src/features/satsang/$1",
    "^@gallery/(.*)$": "<rootDir>/src/features/gallery/$1",
    "^@contact/(.*)$": "<rootDir>/src/features/contact/$1",
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/$1",
    "\\.svg$": "<rootDir>/src/tests/__mocks__/svgMock.js",
  },

  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-svg|@shopify/flash-list|zustand|immer)",
  ],
};
