import webpack from "webpack";
import "webpack-dev-server";
import Debug from "debug";

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";

import * as vars from "./constants";
import { paths } from "./paths";
import { createEnvironmentHash } from "./utils";
import { KnownPresets, type Preset } from "./presets";
import { withSmpMeasuring } from "./measuring";
import { aliases } from "./aliases";
import { chunkGroups } from "./chunks";
import { getClientEnvironment, type ClientEnvironment } from "./env";

const debug = Debug("webpack:config");

export const configWithPreset = (preset: Preset, env: ClientEnvironment): webpack.Configuration => ({
  entry: paths.appIndexJs,
  output: {
    path: paths.appBuild,
    filename: vars.BUNDLE_OUTPUT_FILENAME,
    assetModuleFilename: vars.BUNDLE_ASSETS_FILENAME,
    clean: true, // clean output directory before build
    publicPath: paths.publicUrl,
  },
  devServer: {
    compress: true,
    http2: false, // true - will work only with https
  },
  // watch file changes
  watchOptions: {
    ignored: "**/node_modules",
  },
  // Webpack noise constrained to errors and warnings
  stats: "errors-warnings",
  performance: {
    maxAssetSize: 4 * 1024 * 1024, // 4MB
    maxEntrypointSize: 1 * 1024 * 1024, // 1MB
    /* Uncomment to raise error during compilation if we reach the size limits */
    // hints: "error",
  },
  infrastructureLogging: { level: "none" },
  /* selected the fastest, ref: https://webpack.js.org/configuration/devtool/#devtool */
  devtool: "eval",
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"],
    },
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      "react-native": "react-native-web",
      ...aliases,
    },
  },
  module: {
    rules: [
      {
        oneOf: [
          // Regular images: AVIF, BPM, GIF, JPEG, PNG, WEBP
          {
            test: [/\.avif$/i, /\.bmp$/i, /\.gif$/i, /\.jpe?g$/i, /\.png$/i, /\.webp$/i],
            type: "asset",
            parser: {
              dataUrlCondition: { maxSize: vars.MAX_INLINED_ASSET_SIZE },
            },
          },
          // Fonts: WOFF, WOFF2, EOT, TTF, OTF
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: "asset",
            generator: {
              filename: vars.BUNDLE_FONTS_FILENAME,
            },
          },
          // SVG as assets
          {
            test: /\.svg$/i,
            type: "asset",
            issuer: /\.[jt]sx?$/i,
            // *.svg?url
            resourceQuery: /url/,
          },
          // SVG as React components
          {
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/i,
            // exclude react component if *.svg?url
            resourceQuery: { not: [/url/] },
            use: ["@svgr/webpack"],
          },
          // Vanilla CSS files
          {
            test: /\.vanilla\.css$/i,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: { ...preset.miniCssExtractLoaderOptions },
              },
              // `url:false` - Required as image imports should be handled via JS/TS import statements
              { loader: "css-loader", options: { url: false } },
            ],
          },
          // CSS files, ignore *.module.css
          {
            test: /\.css$/i,
            exclude: /\.module\.css$/i,
            use: [
              // TODO (olku): enable style-loader for development & mini-css-extract-plugin for production
              {
                loader: MiniCssExtractPlugin.loader,
                options: { ...preset.miniCssExtractLoaderOptions },
              },
              null /*"style-loader"*/,
              "css-loader",
              { loader: "postcss-loader", options: { ...preset.postcssLoaderOptions } },
            ].filter(Boolean),
          },
          // SASS or SCSS files, ignore *.module.{scss,sass}
          {
            test: /\.(scss|sass)$/i,
            exclude: /\.module\.(scss|sass)$/i,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: { ...preset.miniCssExtractLoaderOptions },
              },
              null /*"style-loader"*/,
              "css-loader",
              { loader: "postcss-loader", options: { ...preset.postcssLoaderOptions } },
              "sass-loader",
            ].filter(Boolean),
          },
          // Style modules, *.module.css
          {
            test: /\.module\.css$/i,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: { ...preset.miniCssExtractLoaderOptions },
              },
              null /*"style-loader"*/,
              { loader: "css-loader", options: { ...preset.modulesCssLoaderOptions } },
              { loader: "postcss-loader", options: { ...preset.postcssLoaderOptions } },
            ].filter(Boolean),
          },
          // Style modules, *.module.{scss,sass}
          {
            test: /\.module\.(scss|sass)$/i,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: { ...preset.miniCssExtractLoaderOptions },
              },
              null /*"style-loader"*/,
              { loader: "css-loader", options: { ...preset.modulesCssLoaderOptions } },
              { loader: "postcss-loader", options: { ...preset.postcssLoaderOptions } },
              "sass-loader",
            ].filter(Boolean),
          },
          // TypeScript react files: TSX, TS, etc.
          {
            test: /\.([cm]?js|jsx|ts|tsx)$/,
            exclude: [/\.(test|spec)\.([cm]?ts|tsx)$/, /__tests__/, /__cypress__/, /node_modules/],
            // use: [{ loader: 'ts-loader', options: preset.tsLoaderOptions }],
            use: [
              {
                loader: "esbuild-loader",
                options: {
                  define: { ...env.defined },
                  ...preset.esbuildLoaderOptions,
                },
              },
            ],
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
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin({ modulesCount: 10000 }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV is set to production
    // during a production build.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin(env.stringified),
    new VanillaExtractPlugin(),
    new MiniCssExtractPlugin({ ...preset.miniCssExtractPluginOptions }),
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      ...preset.htmlPluginOptions,
      env: { ...env.raw },
    }),
  ],
  // persistent caching & chunk optimization
  optimization: {
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      name: false,
      cacheGroups: { ...chunkGroups },
    },
    /* Minimize files. */
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin({
        parallel: true,
        ...preset.cssMinimizerPluginOptions,
      }),
    ],
  },
  cache: {
    type: "filesystem",
    version: createEnvironmentHash(env.raw),
    buildDependencies: {
      config: [__filename],
    },
    cacheDirectory: paths.appCache,
  },
  snapshot: {
    managedPaths: [paths.appNodeModules],
    immutablePaths: [],
    buildDependencies: {
      timestamp: true,
    },
    module: {
      timestamp: true,
    },
    resolve: {
      timestamp: true,
    },
    resolveBuildDependencies: {
      timestamp: true,
    },
  },
});

// TODO (olku): which type should be used here?
export const environmentConfiguration = (webpackEnv: string): webpack.Configuration => {
  const [isEnvDevelopment, isEnvProduction] = vars.ENVIRONMENTS.map((env) => webpackEnv === env);

  const { development, production, test } = KnownPresets;
  const preset = isEnvProduction ? production : isEnvDevelopment ? development : test;

  // TODO (olku): compute object with env variables from process.env
  const publicPath = isEnvProduction ? "/websites/service-center-portal/" : "/";
  const env = getClientEnvironment(publicPath);

  // dump configuration essentials to terminal
  vars.report();

  // compose new configuration based on preset
  const newConfiguration = { ...configWithPreset(preset, env) };

  // TODO (olku): customize configuration based on webpackEnv (development, production, etc.)
  newConfiguration.output!.publicPath = publicPath;

  // apply measurement plugin if enabled
  return withSmpMeasuring(newConfiguration);
};

export default environmentConfiguration;
