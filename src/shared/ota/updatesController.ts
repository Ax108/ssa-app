import * as Updates from "expo-updates";
import { logger } from "@shared/utils/logger";
import { shouldDeferToStoreUpdate } from "@shared/ota/storeUpdateController";

export type OtaSyncStatus =
  | "skipped"
  | "up-to-date"
  | "fetched"
  | "failed"
  | "store-required";

export type OtaSyncResult = {
  status: OtaSyncStatus;
  message?: string;
};

type JsBundleOtaControllerOptions = {
  /** Override for tests; defaults to `__DEV__`. */
  isDevRuntime?: boolean;
};

const resolveIsDev = (override?: boolean): boolean => {
  if (typeof override === "boolean") return override;
  return typeof __DEV__ !== "undefined" ? __DEV__ : false;
};

/**
 * One owner per JS runtime (Strict Mode / remount safe).
 * Challenge App parity: background download; activate on next true opening.
 */
export const createJsBundleOtaController = (
  options: JsBundleOtaControllerOptions = {},
) => {
  const skipInDev = () => resolveIsDev(options.isDevRuntime);
  let inFlight: Promise<void> | null = null;
  let pending = false;
  let reloading = false;

  const download = (): Promise<void> => {
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        if (shouldDeferToStoreUpdate()) {
          logger.debug("[JS-OTA] skipped — store binary update required");
          return;
        }
        const check = await Updates.checkForUpdateAsync();
        if (!check.isAvailable) return;
        const result = await Updates.fetchUpdateAsync();
        if (result.isNew) {
          pending = true;
          logger.info("[JS-OTA] downloaded; pending next opening");
        }
      } catch (error) {
        logger.warn("[JS-OTA] download failed; retry next opening", error);
      }
    })().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };

  return {
    async onOpening(activatePending: boolean): Promise<void> {
      if (skipInDev() || !Updates.isEnabled || reloading) return;
      if (shouldDeferToStoreUpdate()) {
        logger.debug("[JS-OTA] skipped — store binary update required");
        return;
      }
      if (activatePending && pending) {
        reloading = true;
        try {
          await Updates.reloadAsync();
        } catch (error) {
          reloading = false;
          logger.warn(
            "[JS-OTA] activation failed; retry next opening",
            error,
          );
        }
        return;
      }
      await download();
    },
  };
};

export const jsBundleOtaController = createJsBundleOtaController();

/**
 * @deprecated Prefer `jsBundleOtaController` + `useJsBundleOtaSync`.
 * Kept for tests / one-shot callers. Does not reload by default.
 */
export const syncOtaUpdate = async (): Promise<OtaSyncResult> => {
  if (!Updates.isEnabled) {
    return { status: "skipped", message: "updates-disabled" };
  }
  if (shouldDeferToStoreUpdate()) {
    return { status: "store-required" };
  }

  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) {
      return { status: "up-to-date" };
    }
    await Updates.fetchUpdateAsync();
    return { status: "fetched" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      /not supported in development/i.test(message) ||
      /Updates\.checkForUpdateAsync\(\) is not supported/i.test(message)
    ) {
      return { status: "skipped", message };
    }
    return { status: "failed", message };
  }
};

/** Read-only snapshot for debugging / settings screens. */
export const getOtaDebugInfo = () => ({
  isEnabled: Updates.isEnabled,
  isEmbeddedLaunch: Updates.isEmbeddedLaunch,
  updateId: Updates.updateId,
  channel: Updates.channel,
  runtimeVersion: Updates.runtimeVersion,
  createdAt: Updates.createdAt,
});
