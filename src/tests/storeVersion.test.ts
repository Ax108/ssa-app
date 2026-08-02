import {
  getStoreListingUrl,
  isRemoteAppVersionNewer,
} from "@shared/ota/storeVersion";
import type { StoreAppMeta } from "@shared/types/config";

describe("isRemoteAppVersionNewer", () => {
  it("detects patch and minor bumps", () => {
    expect(isRemoteAppVersionNewer("1.0.1", "1.0.0")).toBe(true);
    expect(isRemoteAppVersionNewer("1.1.0", "1.0.9")).toBe(true);
    expect(isRemoteAppVersionNewer("2.0.0", "1.9.9")).toBe(true);
  });

  it("is false when equal or older", () => {
    expect(isRemoteAppVersionNewer("1.0.0", "1.0.0")).toBe(false);
    expect(isRemoteAppVersionNewer("1.0.0", "1.0.1")).toBe(false);
  });
});

describe("getStoreListingUrl", () => {
  const base: StoreAppMeta = {
    latestVersion: "1.0.1",
    androidPackage: "sadhan.sangha",
  };

  it("builds Play Store URL for android", () => {
    expect(getStoreListingUrl(base, "android")).toBe(
      "https://play.google.com/store/apps/details?id=sadhan.sangha",
    );
  });

  it("returns null for ios without app id", () => {
    expect(getStoreListingUrl(base, "ios")).toBeNull();
  });

  it("builds App Store URL when iosAppId is set", () => {
    expect(getStoreListingUrl({ ...base, iosAppId: "1234567890" }, "ios")).toBe(
      "https://apps.apple.com/app/id1234567890",
    );
  });

  it("prefers explicit store URL overrides", () => {
    expect(
      getStoreListingUrl(
        {
          ...base,
          androidStoreUrl: "https://play.google.com/store/apps/details?id=x",
        },
        "android",
      ),
    ).toBe("https://play.google.com/store/apps/details?id=x");
  });
});
