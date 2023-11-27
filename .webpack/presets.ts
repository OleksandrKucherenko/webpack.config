import * as vars from "./constants";

export type Preset = {
  name: vars.NodeEnv;
  tsLoaderOptions?: any;
  esbuildLoaderOptions?: any;
  htmlPluginOptions?: any;
  miniCssExtractPluginOptions?: any;
  miniCssExtractLoaderOptions?: any;
  cssMinimizerPluginOptions?: any;
  modulesCssLoaderOptions?: {
    modules: any;
  };
  postcssLoaderOptions?: {
    postcssOptions: any;
  };
};

export type Presets = Record<vars.NodeEnv, Preset>;

const htmlPluginMinifyOptions = {
  minify: {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeStyleLinkTypeAttributes: true,
    keepClosingSlash: true,
    minifyJS: true,
    minifyCSS: true,
    minifyURLs: true,
  },
};

// TODO (olku): add repeated properties for all presets
const commons: Partial<Preset> = {
  tsLoaderOptions: { experimentalFileCaching: true },
  esbuildLoaderOptions: { target: "es2015" },
  htmlPluginOptions: {
    ...htmlPluginMinifyOptions,
    title: "Caching Enabled",
    inject: true,
  },
  miniCssExtractPluginOptions: {
    filename: vars.BUNDLE_CSS_FILENAME,
    chunkFilename: vars.BUNDLE_CSS_CHUNK_FILENAME,
  },
  modulesCssLoaderOptions: {
    modules: {
      localIdentName: vars.BUNDLE_CSS_LOCAL_INDENT_NAME,
    },
  },
  postcssLoaderOptions: {
    postcssOptions: {
      // TODO (olku): extract configuration to separate file postcss.config.json
      plugins: [
        "postcss-flexbugs-fixes",
        [
          "postcss-preset-env",
          {
            autoprefixer: {
              flexbox: "no-2009",
            },
            stage: 3,
            features: {
              "custom-properties": false,
            },
          },
        ],
      ],
    },
  },
};

export const KnownPresets: Presets = {
  development: {
    ...commons,
    name: "development",
  },
  production: {
    ...commons,
    name: "production",
  },
  test: {
    ...commons,
    name: "test",
  },
} as const;
