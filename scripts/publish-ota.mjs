#!/usr/bin/env bun
/**
 * Export a JS update and stage Expo Updates protocol files for ssa-static.
 *
 * Flat layout (no android/<version>/, no BSDIFF — GitHub Pages is static-only):
 *   ../ssa-static/prod/mobile-app-ota/{android|ios}/
 *     manifest.json, bundles/, assets/
 *
 * Each publish replaces the platform tree with one full Hermes bundle + assets.
 *
 * Usage:
 *   bun run ota:export:android
 *   bun run ota:export:ios
 *   bun run ota:export:all
 *   bun run ota:export -- --platform android --out ../ssa-static/prod/mobile-app-ota
 */
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildImmutableLaunchAsset } from "./otaLaunchTree.mjs";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const CDN_BASE = "https://astrarudra.github.io/ssa-static/prod/mobile-app-ota";

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return fallback;
};

const requestedPlatform = String(getArg("platform", "android")).toLowerCase();
if (!["android", "ios", "all"].includes(requestedPlatform)) {
  console.error(
    `Unsupported --platform ${requestedPlatform}; use android, ios, or all.`,
  );
  process.exit(1);
}
const platforms =
  requestedPlatform === "all" ? ["android", "ios"] : [requestedPlatform];

const outRoot = resolve(
  getArg("out", join(ROOT, "..", "ssa-static", "prod", "mobile-app-ota")),
);
const appJson = JSON.parse(readFileSync(join(ROOT, "app.json"), "utf8")).expo;
const runtimeVersion = String(appJson.version || "1.0.0");

const sha256Base64Url = (buffer) =>
  createHash("sha256").update(buffer).digest("base64url");
const ensureDir = (directory) => mkdirSync(directory, { recursive: true });
const contentTypeForExtension = (extension) => {
  const normalized = String(extension || "")
    .replace(/^\./, "")
    .toLowerCase();
  return (
    {
      gif: "image/gif",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      json: "application/json",
      otf: "font/otf",
      png: "image/png",
      svg: "image/svg+xml",
      ttf: "font/ttf",
      webp: "image/webp",
    }[normalized] || "application/octet-stream"
  );
};

const runExpoExport = (platform, exportDir) => {
  const result = spawnSync(
    "bunx",
    ["expo", "export", "--platform", platform, "--output-dir", exportDir],
    {
      cwd: ROOT,
      stdio: "inherit",
      shell: true,
      env: { ...process.env, OTA_PLATFORM: platform },
    },
  );
  if (result.status !== 0) process.exit(result.status || 1);
};

const exportPlatform = async (platform) => {
  const preferredExportDir = join(ROOT, "dist-ota", "export", platform);
  let exportDir = preferredExportDir;
  const platformOut = join(outRoot, platform);

  console.log(`[ota] platform=${platform} runtimeVersion=${runtimeVersion}`);
  try {
    rmSync(exportDir, { recursive: true, force: true });
  } catch (error) {
    exportDir = join(ROOT, "dist-ota", `export-work-${Date.now()}`, platform);
    console.warn(
      `[ota] could not clear ${preferredExportDir}; using ${exportDir} (${
        error instanceof Error ? error.message : String(error)
      })`,
    );
  }
  console.log(`[ota] export → ${exportDir}`);
  console.log(`[ota] stage  → ${platformOut}`);
  ensureDir(exportDir);
  runExpoExport(platform, exportDir);

  const metadataPath = join(exportDir, "metadata.json");
  if (!existsSync(metadataPath)) {
    throw new Error("[ota] Expo export did not create metadata.json");
  }
  const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  const fileMetadata = metadata.fileMetadata?.[platform];
  if (!fileMetadata?.bundle) {
    throw new Error(
      `[ota] metadata.json has no fileMetadata.${platform}.bundle`,
    );
  }

  // Replace the whole platform tree (full bundle only; no patches / previous).
  rmSync(platformOut, { recursive: true, force: true });
  ensureDir(join(platformOut, "bundles"));
  ensureDir(join(platformOut, "assets"));

  const bundleSource = join(exportDir, fileMetadata.bundle);
  const { bundlePath, asset: launchAsset } = buildImmutableLaunchAsset(
    CDN_BASE,
    platform,
    readFileSync(bundleSource),
  );
  const bundleDestination = join(platformOut, bundlePath);
  ensureDir(dirname(bundleDestination));
  copyFileSync(bundleSource, bundleDestination);

  const assets = [];
  for (const asset of fileMetadata.assets || []) {
    const assetPath =
      asset.path ||
      asset.file ||
      asset.packagerHash ||
      (typeof asset === "string" ? asset : null);
    if (!assetPath || typeof assetPath !== "string") continue;

    let source = join(exportDir, assetPath);
    if (!existsSync(source) && asset.file) source = join(exportDir, asset.file);
    if (!existsSync(source)) {
      console.warn(`[ota] skipping missing asset ${assetPath}`);
      continue;
    }

    const exportedRelativePath = relative(exportDir, source).replace(
      /\\/g,
      "/",
    );
    const destinationPath = `assets/${exportedRelativePath}`;
    const destination = join(platformOut, destinationPath);
    ensureDir(dirname(destination));
    copyFileSync(source, destination);
    const buffer = readFileSync(destination);
    const extension = String(asset.ext || "")
      .replace(/^\./, "")
      .toLowerCase();
    assets.push({
      key:
        asset.key ||
        createHash("md5").update(exportedRelativePath).digest("hex"),
      contentType:
        asset.contentType || asset.type || contentTypeForExtension(extension),
      url: `${CDN_BASE}/${platform}/${destinationPath}`,
      hash: sha256Base64Url(buffer),
      fileExtension: extension
        ? `.${extension}`
        : exportedRelativePath.includes(".")
          ? `.${exportedRelativePath.split(".").pop()}`
          : undefined,
    });
  }

  const updateId = randomUUID();
  const manifest = {
    id: updateId,
    createdAt: new Date().toISOString(),
    runtimeVersion,
    launchAsset,
    assets,
    metadata: {
      channel: "production",
      platform,
    },
    extra: {
      ssa: {
        host: "ssa-static",
        path: `prod/mobile-app-ota/${platform}`,
        launchAsset: "direct",
      },
    },
  };

  writeFileSync(
    join(platformOut, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  console.log(`[ota] wrote ${join(platformOut, "manifest.json")}`);
  console.log(`[ota] launchAsset ${manifest.launchAsset.url}`);
  console.log(`[ota] assets ${assets.length} (full bundle)`);
};

try {
  for (const platform of platforms) await exportPlatform(platform);
  console.log(
    "[ota] Next: commit & push ssa-static (branch release for Pages) so GitHub Pages serves the update.",
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
