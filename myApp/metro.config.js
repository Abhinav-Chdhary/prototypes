const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Workaround for `import.meta` error when using Zustand 5 on Expo Web
// We intercept Metro's resolution and force it to use the CommonJS build instead of the ESM build
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("zustand")) {
    // Determine if it's the root 'zustand' import or a sub-path like 'zustand/middleware'
    const isRoot = moduleName === "zustand";
    try {
      // Force resolve to the .js (CommonJS) extension
      const resolvedPath = require.resolve(
        isRoot ? "zustand/index.js" : `${moduleName}.js`,
      );
      return {
        filePath: resolvedPath,
        type: "sourceFile",
      };
    } catch (e) {
      // If the resolution fails, fallback to default behavior
      return context.resolveRequest(context, moduleName, platform);
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
