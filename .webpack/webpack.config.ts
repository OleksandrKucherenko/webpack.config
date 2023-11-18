import webpack from "webpack";
import "webpack-dev-server";

import * as vars from "./constants";

const configuration: webpack.Configuration = {
  entry: vars.ENTRY_FILE,
  output: {
    path: `${__dirname}/../${vars.BUNDLE_OUTPUT_DIRECTORY}`,
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
};

export default configuration;
