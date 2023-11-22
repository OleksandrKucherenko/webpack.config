import webpack from "webpack";
import "webpack-dev-server";
import Debug from "debug";

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";
import SpeedMeasurePlugin from "speed-measure-webpack-plugin";

import * as vars from "./constants";
import { createEnvironmentHash } from "./utils";
import { KnownPresets, type Preset } from "./presets";

const debug = Debug("webpack:config");

// TODO (olku): compute object with env variables from process.env
const env = {};

export const configWithPreset = (preset: Preset = KnownPresets.development): webpack.Configuration => ({
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
              filename: "static/fonts/[name].[hash][ext]",
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
              { loader: MiniCssExtractPlugin.loader, options: { ...preset.miniCssExtractLoaderOptions } },
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
              { loader: MiniCssExtractPlugin.loader, options: { ...preset.miniCssExtractLoaderOptions } },
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
              { loader: MiniCssExtractPlugin.loader, options: { ...preset.miniCssExtractLoaderOptions } },
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
              { loader: MiniCssExtractPlugin.loader, options: { ...preset.miniCssExtractLoaderOptions } },
              null /*"style-loader"*/,
              { loader: "css-loader", options: { ...preset.modulesCssLoaderOptions } },
              { loader: "postcss-loader", options: { ...preset.postcssLoaderOptions } },
            ].filter(Boolean),
          },
          // Style modules, *.module.{scss,sass}
          {
            test: /\.module\.(scss|sass)$/i,
            use: [
              { loader: MiniCssExtractPlugin.loader, options: { ...preset.miniCssExtractLoaderOptions } },
              null /*"style-loader"*/,
              { loader: "css-loader", options: { ...preset.modulesCssLoaderOptions } },
              { loader: "postcss-loader", options: { ...preset.postcssLoaderOptions } },
              "sass-loader",
            ].filter(Boolean),
          },
          // TypeScript react files: TSX, TS, etc.
          {
            test: /\.([cm]?ts|tsx)$/,
            use: [{ loader: "ts-loader", options: preset.tsLoaderOptions }],
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
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
  plugins: [
    new VanillaExtractPlugin(),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash].css",
      chunkFilename: "static/css/[name].[contenthash].chunk.css",
      ...preset.miniCssExtractPluginOptions,
    }),
    new HtmlWebpackPlugin({
      title: "Caching Enabled",
      inject: true,
      template: vars.TEMPLATE_FILE,
      ...preset.htmlPluginOptions,
    }),
  ],
  // persistent caching & chunk optimization
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
    version: createEnvironmentHash(env),
    buildDependencies: {
      config: [__filename],
    },
    cacheDirectory: vars.CACHE_DIR,
  },
});

type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
type IndexedPlugin = { index: number; plugin: Flatten<webpack.Configuration["plugins"]> };

const omitPlugins = (configuration: webpack.Configuration, ...names: string[]): IndexedPlugin[] => {
  const { plugins } = configuration;
  if (!plugins) throw new Error("Plugins are not defined.");

  const extracted = plugins
    .map((plugin, index) => (names.includes(plugin?.constructor.name ?? "<skip>") ? { index, plugin } : null))
    .filter(Boolean) as IndexedPlugin[];

  return extracted ?? [];
};

const recoverPlugins = (configuration: webpack.Configuration, ...plugins: IndexedPlugin[]) => {
  const { plugins: originalPlugins } = configuration;
  if (!originalPlugins) throw new Error("Plugins are not defined.");

  plugins.forEach(({ index, plugin }) => {
    originalPlugins[index] = plugin;
  });
};

const withSmpMeasuring = (configuration: webpack.Configuration) => {
  // FIXME (olku): this is a hack/workaround to get the SMP plugin work.
  // ref: https://github.com/stephencookdev/speed-measure-webpack-plugin/issues/167
  const excludes = omitPlugins(configuration, "MiniCssExtractPlugin");

  const smp = new SpeedMeasurePlugin({ disable: !process.env.MEASURE });
  const withSmpMeasuring = smp.wrap(configuration);

  recoverPlugins(withSmpMeasuring, ...excludes);

  return withSmpMeasuring;
};

// TODO (olku): which type should be used here?
export const environmentConfiguration = (webpackEnv: string): webpack.Configuration => {
  const [isEnvDevelopment, isEnvProduction] = ["development", "production"].map((env) => webpackEnv === env);
  vars.report();

  const { development, production, test } = KnownPresets;
  const preset = isEnvProduction ? production : isEnvDevelopment ? development : test;

  // compose new configuration based on preset
  const newConfiguration = { ...configWithPreset(preset) };

  // TODO (olku): customize configuration based on webpackEnv (development, production, etc.)

  return withSmpMeasuring(newConfiguration);
};

export default environmentConfiguration;
