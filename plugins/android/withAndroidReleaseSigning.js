// ============================================================================
// FILE: withAndroidReleaseSigning.js
// LOCATION: plugins/android/withAndroidReleaseSigning.js
// PURPOSE: Inject Play upload-key signing from `.env` on every Android prebuild
// COMMENTS FOR AI: CUSTOM CONFIG PLUGIN — do not hand-edit generated android/ for signing
// ============================================================================

const {
  createRunOncePlugin,
  withAppBuildGradle,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const ENV_KEYS = {
  storeFile: "ANDROID_UPLOAD_STORE_FILE",
  keyAlias: "ANDROID_UPLOAD_KEY_ALIAS",
  storePassword: "ANDROID_UPLOAD_STORE_PASSWORD",
  keyPassword: "ANDROID_UPLOAD_KEY_PASSWORD",
};

/** Filename placed under android/app/ for Gradle `storeFile file(...)`. */
const APP_KEYSTORE_NAME = "upload-keystore.keystore";

/**
 * Parse a simple KEY=VALUE `.env` (no export, no multiline).
 * @param {string} envPath
 * @returns {Record<string, string>}
 */
function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  /** @type {Record<string, string>} */
  const out = {};
  const text = fs.readFileSync(envPath, "utf8");

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }

  return out;
}

/**
 * Merge `.env` then `process.env` (process wins).
 * @param {string} projectRoot
 */
function loadSigningEnv(projectRoot) {
  const fromFile = parseEnvFile(path.join(projectRoot, ".env"));
  const get = (key) => {
    const fromProc = process.env[key];
    if (fromProc != null && String(fromProc).trim() !== "") {
      return String(fromProc).trim();
    }
    const fromDot = fromFile[key];
    if (fromDot != null && String(fromDot).trim() !== "") {
      return String(fromDot).trim();
    }
    return "";
  };

  return {
    storeFile: get(ENV_KEYS.storeFile),
    keyAlias: get(ENV_KEYS.keyAlias),
    storePassword: get(ENV_KEYS.storePassword),
    keyPassword: get(ENV_KEYS.keyPassword),
  };
}

/**
 * @param {{ storeFile: string, keyAlias: string, storePassword: string, keyPassword: string }} creds
 */
function hasCompleteCredentials(creds) {
  return Boolean(
    creds.storeFile &&
      creds.keyAlias &&
      creds.storePassword &&
      creds.keyPassword,
  );
}

/**
 * Resolve keystore path from `.env` (absolute or relative to project root).
 * @param {string} projectRoot
 * @param {string} storeFile
 */
function resolveKeystorePath(projectRoot, storeFile) {
  if (path.isAbsolute(storeFile)) {
    return storeFile;
  }
  return path.resolve(projectRoot, storeFile);
}

/**
 * Copy keystore into android/app and write MYAPP_UPLOAD_* into gradle.properties.
 * @param {string} projectRoot
 * @param {{ storeFile: string, keyAlias: string, storePassword: string, keyPassword: string }} creds
 */
function applyGradlePropertiesAndKeystore(projectRoot, creds) {
  const sourceKeystore = resolveKeystorePath(projectRoot, creds.storeFile);
  if (!fs.existsSync(sourceKeystore)) {
    throw new Error(
      `[withAndroidReleaseSigning] Keystore not found: ${sourceKeystore} ` +
        `(set ${ENV_KEYS.storeFile} in .env)`,
    );
  }

  const appDir = path.join(projectRoot, "android", "app");
  const destKeystore = path.join(appDir, APP_KEYSTORE_NAME);
  fs.mkdirSync(appDir, { recursive: true });
  fs.copyFileSync(sourceKeystore, destKeystore);

  const gradlePropertiesPath = path.join(
    projectRoot,
    "android",
    "gradle.properties",
  );
  if (!fs.existsSync(gradlePropertiesPath)) {
    throw new Error(
      `[withAndroidReleaseSigning] Missing ${gradlePropertiesPath}`,
    );
  }

  let content = fs.readFileSync(gradlePropertiesPath, "utf8");
  const pairs = {
    MYAPP_UPLOAD_STORE_FILE: APP_KEYSTORE_NAME,
    MYAPP_UPLOAD_KEY_ALIAS: creds.keyAlias,
    MYAPP_UPLOAD_STORE_PASSWORD: creds.storePassword,
    MYAPP_UPLOAD_KEY_PASSWORD: creds.keyPassword,
  };

  for (const [key, value] of Object.entries(pairs)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(content)) {
      content = content.replace(re, line);
    } else {
      content = content.replace(/\s*$/, `\n${line}\n`);
    }
  }

  fs.writeFileSync(gradlePropertiesPath, content);
  console.log(
    `[withAndroidReleaseSigning] Copied keystore → android/app/${APP_KEYSTORE_NAME} and wrote gradle.properties`,
  );
}

const RELEASE_SIGNING_INNER = `        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
`;

/**
 * Find a top-level `name { ... }` block body range via brace matching.
 * @param {string} src
 * @param {string} name e.g. "signingConfigs"
 * @returns {{ start: number, end: number, bodyStart: number } | null}
 */
function findNamedBlock(src, name) {
  const re = new RegExp(`\\b${name}\\s*\\{`);
  const match = re.exec(src);
  if (!match) {
    return null;
  }
  const openBrace = match.index + match[0].length - 1;
  let depth = 0;
  for (let i = openBrace; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return {
          start: match.index,
          bodyStart: openBrace + 1,
          end: i,
        };
      }
    }
  }
  return null;
}

/**
 * Inject signingConfigs.release and point release buildType at it.
 * @param {string} buildGradle
 */
function injectReleaseSigning(buildGradle) {
  let next = buildGradle;
  const signing = findNamedBlock(next, "signingConfigs");
  if (!signing) {
    throw new Error(
      "[withAndroidReleaseSigning] signingConfigs block not found in app/build.gradle",
    );
  }

  const signingBody = next.slice(signing.bodyStart, signing.end);
  let newSigningBody;
  if (/\brelease\s*\{/.test(signingBody)) {
    newSigningBody = signingBody.replace(
      /\brelease\s*\{[\s\S]*?\n\s*\}/,
      RELEASE_SIGNING_INNER.trimEnd(),
    );
  } else {
    newSigningBody = `${signingBody.replace(/\s*$/, "")}\n${RELEASE_SIGNING_INNER}`;
  }

  next =
    next.slice(0, signing.bodyStart) +
    newSigningBody +
    next.slice(signing.end);

  const buildTypes = findNamedBlock(next, "buildTypes");
  if (!buildTypes) {
    throw new Error(
      "[withAndroidReleaseSigning] buildTypes block not found in app/build.gradle",
    );
  }

  const btBody = next.slice(buildTypes.bodyStart, buildTypes.end);
  const releaseInBt = findNamedBlock(btBody, "release");
  if (!releaseInBt) {
    throw new Error(
      "[withAndroidReleaseSigning] buildTypes.release not found in app/build.gradle",
    );
  }

  let releaseBody = btBody.slice(releaseInBt.bodyStart, releaseInBt.end);
  if (/signingConfig\s+signingConfigs\.release\b/.test(releaseBody)) {
    // already correct
  } else if (/signingConfig\s+signingConfigs\.debug\b/.test(releaseBody)) {
    releaseBody = releaseBody.replace(
      /signingConfig\s+signingConfigs\.debug\b/,
      "signingConfig signingConfigs.release",
    );
  } else {
    releaseBody = `\n            signingConfig signingConfigs.release${releaseBody}`;
  }

  const newBtBody =
    btBody.slice(0, releaseInBt.bodyStart) +
    releaseBody +
    btBody.slice(releaseInBt.end);

  next =
    next.slice(0, buildTypes.bodyStart) +
    newBtBody +
    next.slice(buildTypes.end);

  return next;
}

/**
 * Reads upload-key credentials from project `.env` (or process.env) and
 * injects them on every Android prebuild so `./gradlew bundleRelease`
 * does not require hand-editing `android/`.
 *
 * Required `.env` keys:
 * - ANDROID_UPLOAD_STORE_FILE
 * - ANDROID_UPLOAD_KEY_ALIAS
 * - ANDROID_UPLOAD_STORE_PASSWORD
 * - ANDROID_UPLOAD_KEY_PASSWORD
 *
 * If any key is missing, the plugin no-ops (debug signing remains) so
 * day-to-day prebuild still works.
 */
function withAndroidReleaseSigning(config) {
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const creds = loadSigningEnv(projectRoot);

      if (!hasCompleteCredentials(creds)) {
        console.warn(
          "[withAndroidReleaseSigning] Skipping release signing — set " +
            Object.values(ENV_KEYS).join(", ") +
            " in `.env` (see `.env.example`).",
        );
        return config;
      }

      applyGradlePropertiesAndKeystore(projectRoot, creds);
      return config;
    },
  ]);

  config = withAppBuildGradle(config, (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const creds = loadSigningEnv(projectRoot);

    if (!hasCompleteCredentials(creds)) {
      return config;
    }

    config.modResults.contents = injectReleaseSigning(
      config.modResults.contents,
    );
    console.log(
      "[withAndroidReleaseSigning] Injected signingConfigs.release into app/build.gradle",
    );
    return config;
  });

  return config;
}

module.exports = createRunOncePlugin(
  withAndroidReleaseSigning,
  "withAndroidReleaseSigning",
  "1.0.0",
);
