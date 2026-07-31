#!/usr/bin/env bun
/**
 * iOS prebuild with OTA_PLATFORM=ios.
 * Skips cleanly on non-macOS so `bun run prebuild` still works on Windows.
 */
import { spawnSync } from "node:child_process";
import os from "node:os";

if (os.platform() !== "darwin") {
  console.log(
    "[prebuild:ios] Skipped — macOS + Xcode required for the ios/ tree. " +
      "On a Mac later, run: bun run prebuild:ios",
  );
  process.exit(0);
}

process.env.OTA_PLATFORM = "ios";
const result = spawnSync(
  "bunx",
  ["expo", "prebuild", "--clean", "--platform", "ios"],
  { stdio: "inherit", env: process.env, shell: true },
);
process.exit(result.status ?? 1);
