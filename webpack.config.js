const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const webpack = require("webpack");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "org",
    projectName: "playground",
    webpackConfigEnv,
    argv,
    outputSystemJS: false,
  });

  defaultConfig.resolve = defaultConfig.resolve || {};

  /* ── Prioritise .ts/.tsx so Webpack picks ESM sources in libs/ ─────
     The pre-compiled .js files use CJS (exports.__esModule) which
     causes "exports is not defined" when bundled into an ESM output. */
  defaultConfig.resolve.extensions = [
    ".ts", ".tsx", ".mjs", ".js", ".jsx", ".wasm", ".json",
  ];

  defaultConfig.resolve.alias = {
    ...(defaultConfig.resolve.alias || {}),
    "@org/auth": path.resolve(__dirname, "../../libs/auth/src/index.ts"),
    "@org/data-access": path.resolve(
      __dirname,
      "../../libs/data-access/src/axios-client.ts"
    ),
    "@org/contracts": path.resolve(
      __dirname,
      "../../libs/contracts/src/index.ts"
    ),
    "@org/i18n": path.resolve(__dirname, "../../libs/i18n/src/index.ts"),
    "@org/ui-kit/design-system": path.resolve(
      __dirname,
      "../../libs/ui-kit/design-system/src/index.ts"
    ),
  };

  const baseExternals = defaultConfig.externals;
  const allowBundle = new Set([
    "@org/auth",
    "@org/data-access",
    "@org/contracts",
    "@org/i18n",
    "@org/ui-kit/design-system",
  ]);
  const customExternals = (context, request, callback) => {
    if (allowBundle.has(request)) {
      return callback();
    }
    if (typeof baseExternals === "function") {
      return baseExternals(context, request, callback);
    }
    if (Array.isArray(baseExternals)) {
      for (const ext of baseExternals) {
        if (typeof ext === "function") {
          let handled = false;
          ext(context, request, (err, result) => {
            if (err) return callback(err);
            if (result !== undefined) {
              handled = true;
              return callback(null, result);
            }
          });
          if (handled) return;
        } else if (typeof ext === "object" && ext[request]) {
          return callback(null, ext[request]);
        }
      }
      return callback();
    }
    return callback();
  };

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    externals: customExternals,
    performance: {
      hints: false,
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.API_BASE_URL": JSON.stringify(process.env.API_BASE_URL || ""),
        "process.env.AUTH_BASE_URL": JSON.stringify(process.env.AUTH_BASE_URL || ""),
        __API_BASE_URL__: JSON.stringify(process.env.API_BASE_URL || ""),
        __AUTH_BASE_URL__: JSON.stringify(process.env.AUTH_BASE_URL || ""),
      }),
    ],
    devServer: {
      ...(defaultConfig.devServer || {}),
      headers: {
        ...((defaultConfig.devServer && defaultConfig.devServer.headers) || {}),
        "Access-Control-Allow-Origin": "*",
      },
    },
  });
};
