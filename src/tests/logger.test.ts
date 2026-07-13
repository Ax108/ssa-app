import { logger } from "@shared/utils/logger";

describe("logger", () => {
  it("exposes log, info, debug, warn, and error", () => {
    expect(typeof logger.log).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("forwards to console in the current environment without throwing", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    const debug = jest.spyOn(console, "debug").mockImplementation(() => {});
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const error = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      logger.log("log");
      logger.info("info");
      logger.debug("debug");
      logger.warn("warn");
      logger.error("error");
    }).not.toThrow();

    log.mockRestore();
    info.mockRestore();
    debug.mockRestore();
    warn.mockRestore();
    error.mockRestore();
  });
});
