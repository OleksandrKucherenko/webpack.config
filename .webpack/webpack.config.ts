import webpack from "webpack";
import "webpack-dev-server";
import Debug from "debug";

import HtmlWebpackPlugin from "html-webpack-plugin";

import * as vars from "./constants";
import { createEnvironmentHash } from "./utils";

const debug = Debug("webpack:config");

// TODO (olku): compute object with env variables from process.env
const env = {};

export const configuration: webpack.Configuration = {
  entry: vars.ENTRY_FILE,
  output: {
    path: vars.OUTPUT_DIR,
    filename: vars.BUNDLE_OUTPUT_FILE_NAME,
    assetModuleFilename: "static/media/[name].[hash][ext]",
    clean: true, // clean output directory before build
    publicPath: "",
  },
  devServer: {
    compress: true,
    http2: false, // true - will work only with https
  },
  // Webpack noise constrained to errors and warnings
  stats: "errors-warnings",
  performance: {
    maxAssetSize: 4 * 1024 * 1024, // 4MB
    maxEntrypointSize: 1 * 1024 * 1024, // 1MB
    // hints: "error" /* Uncomment to raise error during compilation if we reach the size limits */,
  },
  infrastructureLogging: { level: "none" },
  devtool: "eval" /* selected the fastest, ref: https://webpack.js.org/configuration/devtool/#devtool */,
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
        oneOf: [
          // TODO: Merge this config once `image/avif` is in the mime-db, ref: https://github.com/jshttp/mime-db
          {
            test: [/\.avif$/],
            type: "asset",
            // mimetype: "image/avif",
            parser: {
              dataUrlCondition: { maxSize: vars.MAX_INLINED_ASSET_SIZE },
            },
          },
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          // A missing `test` is equivalent to a match.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/],
            type: "asset",
            parser: {
              dataUrlCondition: { maxSize: vars.MAX_INLINED_ASSET_SIZE },
            },
          },
          // Fonts
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: "asset",
          },
          // SVG as React components and as assets
          {
            test: /\.svg$/i,
            type: "asset",
            issuer: /\.[jt]sx?$/,
            // *.svg?url
            resourceQuery: /url/,
          },
          {
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            // exclude react component if *.svg?url
            resourceQuery: { not: [/url/] },
            use: ["@svgr/webpack"],
          },
          // TypeScript react files
          {
            test: /\.([cm]?ts|tsx)$/,
            use: "ts-loader",
            exclude: /node_modules/,
          },
          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise be processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpack's internal loaders.
            exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            type: "asset/resource",
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Caching Enabled",
      inject: true,
      template: vars.TEMPLATE_FILE,
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

export const reportImportantThings = () => {
  // Dump important configuration values
  debug('output directory: "%s"', vars.OUTPUT_DIR);
  debug('cache directory: "%s"', vars.CACHE_DIR);
  debug("inlining images up to %s bytes", vars.MAX_INLINED_ASSET_SIZE);
};

// TODO (olku): which type should be used here?
export const environmentConfiguration = (webpackEnv: string): webpack.Configuration => {
  const [isEnvDevelopment, isEnvProduction] = ["development", "production"].map((env) => webpackEnv === env);
  reportImportantThings();

  const newConfiguration = { ...configuration };

  // TODO (olku): customize configuration based on webpackEnv (development, production, etc.)

  return newConfiguration;
};

export default environmentConfiguration;
