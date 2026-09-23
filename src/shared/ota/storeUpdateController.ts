import { appStore } from "@store/appStore";
import {
  getInstalledAppVersion,
  getStoreListingUrl,
  isRemoteAppVersionNewer,
} from "@shared/ota/storeVersion";
import { logger } from "@shared/utils/logger";

/**
 * True when CDN `storeApp.latestVersion` is newer than the installed binary.
 * When true, JS OTA must not run — user needs a Play / App Store update.
 */
export const shouldDeferToStoreUpdate = (): boolean => {
  const storeApp = appStore.getState().config?.storeApp;
  if (!storeApp?.latestVersion?.trim()) return false;
  const installed = getInstalledAppVersion();
  if (!isRemoteAppVersionNewer(storeApp.latestVersion, installed)) return false;
  return Boolean(getStoreListingUrl(storeApp));
};

/**
 * After splash / content load: show the store-update prompt when CDN
 * `storeApp.latestVersion` is newer than the binary. Dismiss hides it until
 * the next cold start (same old version → show again).
 */
export const evaluateStoreUpdatePrompt = (): void => {
  const { config, storeUpdateDismissedThisSession, setStoreUpdateVisible } =
    appStore.getState();

  if (storeUpdateDismissedThisSession) {
    setStoreUpdateVisible(false);
    return;
  }

  const storeApp = config?.storeApp;
  if (!storeApp?.latestVersion?.trim()) {
    setStoreUpdateVisible(false);
    return;
  }

  const installed = getInstalledAppVersion();
  if (!isRemoteAppVersionNewer(storeApp.latestVersion, installed)) {
    setStoreUpdateVisible(false);
    return;
  }

  const storeUrl = getStoreListingUrl(storeApp);
  if (!storeUrl) {
    logger.log(
      "[StoreUpdate] newer version on CDN but no store URL for this platform",
    );
    setStoreUpdateVisible(false);
    return;
  }

  logger.log("[StoreUpdate] prompt", installed, "→", storeApp.latestVersion);
  setStoreUpdateVisible(true);
};
