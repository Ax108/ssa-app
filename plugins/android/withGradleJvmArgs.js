// ============================================================================
// FILE: withGradleJvmArgs.js
// LOCATION: plugins/android/withGradleJvmArgs.js
// PURPOSE: Raise Gradle daemon heap in android/gradle.properties after prebuild
// COMMENTS FOR AI: CUSTOM CONFIG PLUGIN — not a hand-edit of the generated android/ tree
// ============================================================================

const { createRunOncePlugin, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const JVMARGS =
  "-Xmx6144m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8";

/**
 * Sets or replaces org.gradle.jvmargs in android/gradle.properties.
 * Needed for release native builds (Reanimated CMake / D8) on Windows.
 *
 * @param {string} gradlePropertiesPath - Path to android/gradle.properties
 */
function updateGradleJvmArgs(gradlePropertiesPath) {
  let content = fs.readFileSync(gradlePropertiesPath, "utf-8");
  const jvmLine = `org.gradle.jvmargs=${JVMARGS}`;

  if (/^org\.gradle\.jvmargs=/m.test(content)) {
    content = content.replace(/^org\.gradle\.jvmargs=.*$/m, jvmLine);
  } else {
    content += `\n${jvmLine}\n`;
  }

  fs.writeFileSync(gradlePropertiesPath, content);
  console.log(
    "📦 Updated org.gradle.jvmargs in gradle.properties (6g heap for release/native)",
  );
}

/**
 * Runs on expo prebuild — patches generated android/gradle.properties.
 */
const withGradleJvmArgs = (config) => {
  console.log("✅ Running withGradleJvmArgs plugin");

  config = withDangerousMod(config, [
    "android",
    (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const gradlePropertiesPath = path.join(
        projectRoot,
        "android",
        "gradle.properties",
      );

      if (!fs.existsSync(gradlePropertiesPath)) {
        console.warn(
          "⚠️ gradle.properties not found at:",
          gradlePropertiesPath,
          "(run prebuild first)",
        );
        return config;
      }

      updateGradleJvmArgs(gradlePropertiesPath);
      return config;
    },
  ]);

  return config;
};

module.exports = createRunOncePlugin(
  withGradleJvmArgs,
  "withGradleJvmArgs",
  "1.0.0",
);
