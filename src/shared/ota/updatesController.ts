import * as Updates from "expo-updates";
import { logger } from "@shared/utils/logger";

export type OtaSyncStatus = "skipped" | "up-to-date" | "fetched" | "failed";

export type OtaSyncResult = {
  status: OtaSyncStatus;
  message?: string;
};

export type OtaSyncOptions = {
  /**
   * When true, reload the app immediately after downloading an update.
   * Default false — update applies on the next cold start.
   */
  reloadImmediately?: boolean;
};

const isDevUpdatesUnsupported = (message: string): boolean =>
  /not supported in development/i.test(message) ||
  /Updates\.checkForUpdateAsync\(\) is not supported/i.test(message);

/**
 * Check the self-hosted Expo Updates manifest (ssa-static CDN) and download
 * a newer JS bundle when available.
 *
 * Expo development / Metro builds often have updates disabled — those skip
 * quietly. Release / production-like binaries still check the CDN.
 */
export const syncOtaUpdate = async (
  options: OtaSyncOptions = {},
): Promise<OtaSyncResult> => {
  const { reloadImmediately = false } = options;

  if (!Updates.isEnabled) {
    logger.debug("[OTA] skipped — expo-updates disabled in this build");
    return { status: "skipped", message: "updates-disabled" };
  }

  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) {
      logger.debug("[OTA] No update available");
      return { status: "up-to-date" };
    }

    logger.log("[OTA] Fetching update…");
    await Updates.fetchUpdateAsync();

    if (reloadImmediately) {
      await Updates.reloadAsync();
    }

    logger.log(
      reloadImmediately
        ? "[OTA] Update applied (reload)"
        : "[OTA] Update downloaded; applies on next cold start",
    );
    return { status: "fetched" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (isDevUpdatesUnsupported(message)) {
      logger.debug("[OTA] skipped — not supported in this development build");
      return { status: "skipped", message };
    }
    logger.warn("[OTA] sync failed", message);
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
