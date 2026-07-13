const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // Block tests / Jest utilities from the app bundle
  const blockList = [
    /[/\\]__tests__[/\\].*/,
    /[/\\]tests[/\\].*/,
    /\.test\.[jt]sx?$/,
    /\.spec\.[jt]sx?$/,
    /[/\\]jest\.setup\.js$/,
  ];

  const extraSourceExts = ["cjs", "mjs"];
  const extraAssetExts = [
    "glb",
    "gltf",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "mp4",
    "mov",
    "webm",
    "avif",
    "mkv",
    "ttf",
    "html",
  ];

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  };

  config.resolver = {
    ...resolver,
    blockList,
    assetExts: [
      ...new Set([
        ...resolver.assetExts.filter((ext) => ext !== "svg"),
        ...extraAssetExts,
      ]),
    ],
    sourceExts: [
      ...new Set([...resolver.sourceExts, ...extraSourceExts, "svg"]),
    ],
  };

  return config;
})();
