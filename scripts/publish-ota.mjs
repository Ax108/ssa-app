#!/usr/bin/env bun
/**
 * Export a JS update and stage Expo Updates protocol files for ssa-static.
 *
 * Usage:
 *   bun run ota:export:android
 *   bun run ota:export:ios
 *   bun run ota:export:all
 *   bun run ota:export -- --platform android
 *   bun run ota:export -- --platform ios --out ../ssa-static/prod/mobile-app-ota
 *
 * Default --out is ../ssa-static/prod/mobile-app-ota (local clone of
 * https://github.com/astrarudra/ssa-static). Then commit/push that repo so
 * GitHub Pages serves the new files.
 */
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
import { spawnSync } from "node:child_process";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const CDN_BASE =
  "https://astrarudra.github.io/ssa-static/prod/mobile-app-ota";

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return fallback;
};

const platform = (getArg("platform", "android") || "android").toLowerCase();
if (platform !== "android" && platform !== "ios") {
  console.error(`Unsupported --platform ${platform} (use android|ios)`);
  process.exit(1);
}

const outRoot = resolve(
  getArg("out", join(ROOT, "..", "ssa-static", "prod", "mobile-app-ota")),
);
const platformOut = join(outRoot, platform);
const exportDir = join(ROOT, "dist-ota");

const appJson = JSON.parse(
  readFileSync(join(ROOT, "app.json"), "utf8"),
).expo;
const runtimeVersion = String(appJson.version || "1.0.0");

console.log(`[ota] platform=${platform} runtimeVersion=${runtimeVersion}`);
console.log(`[ota] export → ${exportDir}`);
console.log(`[ota] stage  → ${platformOut}`);

rmSync(exportDir, { recursive: true, force: true });
mkdirSync(exportDir, { recursive: true });

const exportResult = spawnSync(
  "bunx",
  [
    "expo",
    "export",
    "--platform",
    platform,
    "--output-dir",
    exportDir,
  ],
  { cwd: ROOT, stdio: "inherit", shell: true },
);
if (exportResult.status !== 0) {
  process.exit(exportResult.status || 1);
}

const metadataPath = join(exportDir, "metadata.json");
if (!existsSync(metadataPath)) {
  console.error("[ota] missing metadata.json from expo export");
  process.exit(1);
}

const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
const fileMeta = metadata.fileMetadata?.[platform];
if (!fileMeta?.bundle) {
  console.error(`[ota] metadata.json has no fileMetadata.${platform}.bundle`);
  process.exit(1);
}

const sha256Base64Url = (buf) =>
  createHash("sha256").update(buf).digest("base64url");

const ensureDir = (p) => mkdirSync(p, { recursive: true });

rmSync(join(platformOut, "bundles"), { recursive: true, force: true });
rmSync(join(platformOut, "assets"), { recursive: true, force: true });
ensureDir(join(platformOut, "bundles"));
ensureDir(join(platformOut, "assets"));

const bundleSrc = join(exportDir, fileMeta.bundle);
const bundleName = fileMeta.bundle.split("/").pop() || "index.hbc";
const bundleDestRel = `bundles/${bundleName}`;
const bundleDest = join(platformOut, bundleDestRel);
ensureDir(dirname(bundleDest));
copyFileSync(bundleSrc, bundleDest);
const bundleBuf = readFileSync(bundleDest);

const assets = [];
for (const asset of fileMeta.assets || []) {
  // expo export asset entries vary; support path / file / packagerPath
  const rel =
    asset.path ||
    asset.file ||
    asset.packagerHash ||
    (typeof asset === "string" ? asset : null);
  if (!rel || typeof rel !== "string") continue;

  // Prefer copying from export root by relative path when present
  let src = join(exportDir, rel);
  if (!existsSync(src) && asset.file) {
    src = join(exportDir, asset.file);
  }
  if (!existsSync(src)) {
    console.warn(`[ota] skip missing asset: ${rel}`);
    continue;
  }

  const destName = relative(exportDir, src).replace(/\\/g, "/");
  const destRel = `assets/${destName}`;
  const dest = join(platformOut, destRel);
  ensureDir(dirname(dest));
  copyFileSync(src, dest);
  const buf = readFileSync(dest);
  assets.push({
    key: asset.key || createHash("md5").update(destName).digest("hex"),
    contentType: asset.contentType || asset.type || "application/octet-stream",
    url: `${CDN_BASE}/${platform}/${destRel}`,
    hash: sha256Base64Url(buf),
    fileExtension: destName.includes(".")
      ? `.${destName.split(".").pop()}`
      : undefined,
  });
}

const manifest = {
  id: randomUUID(),
  createdAt: new Date().toISOString(),
  runtimeVersion,
  launchAsset: {
    key: "bundle",
    contentType: "application/javascript",
    url: `${CDN_BASE}/${platform}/${bundleDestRel}`,
    hash: sha256Base64Url(bundleBuf),
  },
  assets,
  metadata: {
    channel: "production",
    platform,
  },
  extra: {
    ssa: {
      host: "ssa-static",
      path: `prod/mobile-app-ota/${platform}`,
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
console.log(`[ota] assets ${assets.length}`);
console.log(
  "[ota] Next: commit & push ssa-static so GitHub Pages serves the update.",
);
