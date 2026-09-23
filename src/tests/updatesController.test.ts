import {
  createJsBundleOtaController,
  getOtaDebugInfo,
  syncOtaUpdate,
  type OtaSyncResult,
} from "@shared/ota/updatesController";
import * as Updates from "expo-updates";
import { Platform } from "react-native";
import { appStore } from "@store/appStore";

jest.mock("@shared/ota/storeVersion", () => {
  const actual = jest.requireActual("@shared/ota/storeVersion");
  return {
    ...actual,
    getInstalledAppVersion: jest.fn(() => "1.0.0"),
  };
});

const mockUpdates = Updates as unknown as {
  isEnabled: boolean;
  checkForUpdateAsync: jest.Mock;
  fetchUpdateAsync: jest.Mock;
  reloadAsync: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdates.isEnabled = true;
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    get: () => "android",
  });
  appStore.setState({ config: null });
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "debug").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});
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

  it("returns store-required when CDN store version is newer", async () => {
    appStore.setState({
      config: {
        storeApp: {
          latestVersion: "9.9.9",
          androidPackage: "sadhan.sangha",
        },
      } as never,
    });

    const result = await syncOtaUpdate();
    expect(result.status).toBe("store-required");
    expect(mockUpdates.checkForUpdateAsync).not.toHaveBeenCalled();
  });

  it("returns up-to-date when no remote update", async () => {
    mockUpdates.checkForUpdateAsync.mockResolvedValue({ isAvailable: false });
    const result = await syncOtaUpdate();
    expect(result).toEqual({ status: "up-to-date" } satisfies OtaSyncResult);
    expect(mockUpdates.fetchUpdateAsync).not.toHaveBeenCalled();
  });

  it("fetches when an update is available without reloading", async () => {
    mockUpdates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
    mockUpdates.fetchUpdateAsync.mockResolvedValue({ isNew: true });

    const result = await syncOtaUpdate();

    expect(result.status).toBe("fetched");
    expect(mockUpdates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
    expect(mockUpdates.reloadAsync).not.toHaveBeenCalled();
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

describe("createJsBundleOtaController", () => {
  it("activates a pending update on the next opening only", async () => {
    mockUpdates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
    mockUpdates.fetchUpdateAsync.mockResolvedValue({ isNew: true });
    mockUpdates.reloadAsync.mockResolvedValue(undefined);

    const controller = createJsBundleOtaController({ isDevRuntime: false });
    await controller.onOpening(false);
    expect(mockUpdates.reloadAsync).not.toHaveBeenCalled();

    await controller.onOpening(true);
    expect(mockUpdates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it("skips when store update is required", async () => {
    appStore.setState({
      config: {
        storeApp: {
          latestVersion: "9.9.9",
          androidPackage: "sadhan.sangha",
        },
      } as never,
    });

    const controller = createJsBundleOtaController({ isDevRuntime: false });
    await controller.onOpening(false);
    expect(mockUpdates.checkForUpdateAsync).not.toHaveBeenCalled();
  });
});

describe("getOtaDebugInfo", () => {
  it("exposes runtime fields from expo-updates", () => {
    const info = getOtaDebugInfo();
    expect(typeof info.isEnabled).toBe("boolean");
    expect(info).toHaveProperty("runtimeVersion");
  });
});
