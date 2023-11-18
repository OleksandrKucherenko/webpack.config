import webpack from "webpack";
import "webpack-dev-server";

import HtmlWebpackPlugin from "html-webpack-plugin";

import * as vars from "./constants";
import { createEnvironmentHash } from "./utils";

// TODO (olku): compute object with env variables from process.env
const env = {};

const configuration: webpack.Configuration = {
  entry: vars.ENTRY_FILE,
  output: {
    path: vars.OUTPUT_DIR,
    filename: vars.BUNDLE_OUTPUT_FILE_NAME,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"],
    },
  },
  module: {
    rules: [
      {
        test: /\.([cm]?ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Caching Enabled",
    }),
  ],
  optimization: {
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  cache: {
    type: "filesystem",
    version: createEnvironmentHash(env),
    buildDependencies: {
      config: [__filename],
    },
    cacheDirectory: vars.CACHE_DIR,
  },
};

export default configuration;
