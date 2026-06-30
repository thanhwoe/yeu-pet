const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  new RegExp(path.resolve(workspaceRoot, "apps/node_modules/react")),
  new RegExp(path.resolve(workspaceRoot, "apps/node_modules/react-native")),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.watchFolders = [workspaceRoot];

config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16,
});
