const { NativeModules } = require("react-native");

// Work around an Expo Go runtime issue where Fast Refresh expects
// `window.location` to exist on native before Expo initializes.
if (typeof globalThis.window === "undefined") {
  globalThis.window = globalThis;
}

if (!globalThis.window.location) {
  const scriptUrl = NativeModules?.SourceCode?.scriptURL;
  const match =
    typeof scriptUrl === "string"
      ? scriptUrl.match(/^(https?):\/\/([^/]+)(\/.*)?$/)
      : null;

  if (match) {
    globalThis.window.location = {
      protocol: `${match[1]}:`,
      host: match[2],
      href: scriptUrl,
    };
  }
}

const { registerRootComponent } = require("expo");
const RootApp = require("./src/RootApp").default;

registerRootComponent(RootApp);
