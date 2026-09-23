import { describe, expect, test } from "bun:test";
import { Buffer } from "node:buffer";

import { buildImmutableLaunchAsset } from "./otaLaunchTree.mjs";

describe("SSA OTA launch asset (full bundle, flat paths)", () => {
  test("content-hashed launch asset URLs omit runtime version folders", () => {
    const old = buildImmutableLaunchAsset(
      "https://cdn.test/",
      "android",
      Buffer.from("OLD"),
    );
    const next = buildImmutableLaunchAsset(
      "https://cdn.test/",
      "android",
      Buffer.from("NEW"),
    );
    expect(next.asset.key).not.toBe(old.asset.key);
    expect(next.asset.url).toBe(`https://cdn.test/android/${next.bundlePath}`);
    expect(next.asset.url).not.toContain("/0.0.1/");
    expect(next.bundlePath.startsWith("bundles/")).toBe(true);
    expect(next.bundlePath.endsWith(".hbc")).toBe(true);
  });

  test("same bytes produce a stable URL", () => {
    const a = buildImmutableLaunchAsset(
      "https://cdn.test",
      "ios",
      Buffer.from("SAME"),
    );
    const b = buildImmutableLaunchAsset(
      "https://cdn.test/",
      "ios",
      Buffer.from("SAME"),
    );
    expect(a).toEqual(b);
  });
});
