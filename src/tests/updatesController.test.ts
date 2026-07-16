import {
  getOtaDebugInfo,
  syncOtaUpdate,
  type OtaSyncResult,
} from "@shared/ota/updatesController";
import * as Updates from "expo-updates";

const mockUpdates = Updates as unknown as {
  isEnabled: boolean;
  checkForUpdateAsync: jest.Mock;
  fetchUpdateAsync: jest.Mock;
  reloadAsync: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdates.isEnabled = true;
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("syncOtaUpdate", () => {
  it("skips when Updates.isEnabled is false", async () => {
    mockUpdates.isEnabled = false;

    const result = await syncOtaUpdate();

    expect(result.status).toBe("skipped");
    expect(mockUpdates.checkForUpdateAsync).not.toHaveBeenCalled();
  });

  it("returns up-to-date when no remote update", async () => {
    mockUpdates.checkForUpdateAsync.mockResolvedValue({ isAvailable: false });
    const result = await syncOtaUpdate();
    expect(result).toEqual({ status: "up-to-date" } satisfies OtaSyncResult);
    expect(mockUpdates.fetchUpdateAsync).not.toHaveBeenCalled();
  });

  it("fetches when an update is available without reloading by default", async () => {
    mockUpdates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
    mockUpdates.fetchUpdateAsync.mockResolvedValue({ isNew: true });

    const result = await syncOtaUpdate();

    expect(result.status).toBe("fetched");
    expect(mockUpdates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
    expect(mockUpdates.reloadAsync).not.toHaveBeenCalled();
  });

  it("reloads when reloadImmediately is true", async () => {
    mockUpdates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
    mockUpdates.fetchUpdateAsync.mockResolvedValue({ isNew: true });
    mockUpdates.reloadAsync.mockResolvedValue(undefined);

    await syncOtaUpdate({ reloadImmediately: true });

    expect(mockUpdates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it("skips quietly when Expo rejects development updates", async () => {
    mockUpdates.checkForUpdateAsync.mockRejectedValue(
      new Error(
        "Updates.checkForUpdateAsync() is not supported in development builds.",
      ),
    );
    const result = await syncOtaUpdate();
    expect(result.status).toBe("skipped");
  });

  it("returns failed on other check errors", async () => {
    mockUpdates.checkForUpdateAsync.mockRejectedValue(new Error("offline"));
    const result = await syncOtaUpdate();
    expect(result.status).toBe("failed");
    expect(result.message).toContain("offline");
  });
});

describe("getOtaDebugInfo", () => {
  it("exposes runtime fields from expo-updates", () => {
    const info = getOtaDebugInfo();
    expect(info.runtimeVersion).toBe("1.0.0");
    expect(typeof info.isEnabled).toBe("boolean");
  });
});
