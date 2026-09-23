/**
 * Content-addressed Hermes launch-asset helpers for flat GitHub Pages OTA.
 * Full-bundle only — Pages cannot host BSDIFF negotiation (HTTP 226).
 */
import { createHash } from "node:crypto";

/** Content-hashed Hermes bundle path + Expo launchAsset fields (direct CDN URL). */
export const buildImmutableLaunchAsset = (cdnBase, platform, bytes) => {
  const digest = createHash("sha256").update(bytes).digest();
  const bundlePath = `bundles/${digest.toString("hex")}.hbc`;
  const base = String(cdnBase || "")
    .trim()
    .replace(/\/+$/, "");
  return {
    bundlePath,
    asset: {
      key: digest.toString("hex"),
      hash: digest.toString("base64url"),
      contentType: "application/javascript",
      url: `${base}/${platform}/${bundlePath}`,
    },
  };
};
