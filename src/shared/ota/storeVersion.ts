import Constants from "expo-constants";
import { Platform } from "react-native";
import type { StoreAppMeta } from "@shared/types/config";

/** Installed native / Expo app version (`app.json` → `expo.version`). */
export const getInstalledAppVersion = (): string => {
  const fromExpo =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    Constants.nativeBuildVersion;
  return String(fromExpo || "0.0.0");
};

const parseSemverParts = (version: string): number[] =>
  version
    .trim()
    .replace(/^v/i, "")
    .split(".")
    .map((part) => {
      const n = Number.parseInt(part.replace(/[^0-9].*$/, ""), 10);
      return Number.isFinite(n) ? n : 0;
    });

/** True when `remote` is a higher semver than `local`. */
export const isRemoteAppVersionNewer = (
  remote: string,
  local: string,
): boolean => {
  const a = parseSemverParts(remote);
  const b = parseSemverParts(local);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
};

export const getAndroidPackageName = (storeApp?: StoreAppMeta): string =>
  storeApp?.androidPackage ||
  Constants.expoConfig?.android?.package ||
  "sadhan.sangha";

/**
 * Play / App Store product URL for the current platform.
 * Returns null when this platform cannot deep-link yet (e.g. iOS without `iosAppId`).
 */
export const getStoreListingUrl = (
  storeApp: StoreAppMeta,
  platform: typeof Platform.OS = Platform.OS,
): string | null => {
  if (platform === "android") {
    if (storeApp.androidStoreUrl?.trim()) {
      return storeApp.androidStoreUrl.trim();
    }
    const pkg = getAndroidPackageName(storeApp);
    return `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}`;
  }

  if (platform === "ios") {
    if (storeApp.iosStoreUrl?.trim()) {
      return storeApp.iosStoreUrl.trim();
    }
    const id = storeApp.iosAppId?.trim();
    if (!id) return null;
    return `https://apps.apple.com/app/id${id}`;
  }

  return null;
};
