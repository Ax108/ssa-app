/**
 * Minimal Jest setup for Expo / RN.
 * Add mocks only when a test hits a missing native module.
 */

import "@testing-library/react-native/matchers";
import { cleanup } from "@testing-library/react-native";

afterEach(cleanup);

jest.mock("react-native-worklets", () => ({
  createSerializable: (v) => v,
  createWorkletRuntime: jest.fn(),
  runOnUI: (fn) => fn,
  runOnJS: (fn) => fn,
  scheduleOnRN: (fn, ...args) => fn(...args),
  useSharedValue: (v) => ({ value: v }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: (v) => v,
  withSpring: (v) => v,
}));

/** Lightweight mock — official `react-native-reanimated/mock` breaks on RN Reanimated 4. */
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View } = require("react-native");
  const AnimatedView = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref }),
  );
  AnimatedView.displayName = "Animated.View";

  const Easing = {
    linear: (t) => t,
    ease: (t) => t,
    inOut: (fn) => fn,
    out: (fn) => fn,
    in: (fn) => fn,
  };

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      createAnimatedComponent: (C) => C,
      call: () => {},
    },
    Easing,
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (fn) => (typeof fn === "function" ? fn() : {}),
    withTiming: (v) => v,
    withSpring: (v) => v,
    withRepeat: (v) => v,
    interpolate: (_v, _input, output) => output?.[0] ?? 0,
    Extrapolation: { CLAMP: "clamp" },
  };
});

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
  getStringAsync: jest.fn().mockResolvedValue(""),
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: "1.0.0",
      android: { package: "sadhan.sangha" },
      ios: { bundleIdentifier: "sadhan.sangha" },
    },
    nativeAppVersion: "1.0.0",
    nativeBuildVersion: "1",
  },
}));

jest.mock("expo-updates", () => {
  let isEnabled = true;
  return {
    get isEnabled() {
      return isEnabled;
    },
    set isEnabled(value) {
      isEnabled = Boolean(value);
    },
    isEmbeddedLaunch: true,
    updateId: null,
    channel: null,
    runtimeVersion: "1.0.0",
    createdAt: null,
    checkForUpdateAsync: jest
      .fn()
      .mockResolvedValue({ isAvailable: false }),
    fetchUpdateAsync: jest.fn().mockResolvedValue({ isNew: false }),
    reloadAsync: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("expo-font", () => ({
  loadAsync: jest.fn().mockResolvedValue(undefined),
  isLoaded: jest.fn().mockReturnValue(true),
  useFonts: jest.fn().mockReturnValue([true, null]),
}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key) => store.get(key) ?? null),
      setItem: jest.fn(async (key, value) => {
        store.set(key, value);
      }),
      removeItem: jest.fn(async (key) => {
        store.delete(key);
      }),
      multiGet: jest.fn(async (keys) =>
        keys.map((key) => [key, store.get(key) ?? null]),
      ),
      multiSet: jest.fn(async (pairs) => {
        for (const [k, v] of pairs) {
          store.set(k, v);
        }
      }),
      clear: jest.fn(async () => {
        store.clear();
      }),
      getAllKeys: jest.fn(async () => Array.from(store.keys())),
    },
  };
});

jest.mock("expo-modules-core", () => {
  const actual = jest.requireActual("expo-modules-core");
  return {
    ...actual,
    requireOptionalNativeModule: jest.fn().mockReturnValue(null),
  };
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children, ...props }) =>
      React.createElement(View, props, children),
  };
});

jest.mock("@shared/components/AppLinearGradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    AppLinearGradient: ({ children, ...props }) =>
      React.createElement(View, props, children),
  };
});
jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Image: (props) =>
      React.createElement(View, { ...props, testID: "expo-image" }),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: jest
    .fn()
    .mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: jest
    .fn()
    .mockReturnValue({ x: 0, y: 0, width: 390, height: 844 }),
}));

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: jest.fn().mockReturnValue({
      navigate: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn().mockReturnValue(false),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
    }),
    useNavigationState: jest.fn().mockReturnValue({ index: 0 }),
    useRoute: jest.fn().mockReturnValue({ params: {} }),
    useFocusEffect: jest.fn().mockImplementation((cb) => {
      if (typeof cb === "function") {
        cb();
      }
    }),
    useIsFocused: jest.fn().mockReturnValue(true),
  };
});
