/**
 * Dev-only logger. In production (`__DEV__ === false`) every method is a no-op.
 * Prefer this over raw `console.*` so release builds stay silent.
 */
const isDev =
  typeof __DEV__ !== "undefined"
    ? __DEV__
    : process.env.NODE_ENV !== "production";

type LogFn = (...args: unknown[]) => void;

const noop: LogFn = () => {};

const bind =
  (method: "log" | "info" | "debug" | "warn" | "error"): LogFn =>
  (...args) => {
    if (!isDev) return;
    console[method](...args);
  };

export const logger = {
  log: isDev ? bind("log") : noop,
  info: isDev ? bind("info") : noop,
  debug: isDev ? bind("debug") : noop,
  warn: isDev ? bind("warn") : noop,
  error: isDev ? bind("error") : noop,
};
