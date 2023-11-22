export type NodeEnv = "development" | "production" | "test";

export type Preset = {
  name: NodeEnv;
  tsLoaderOptions?: any;
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

export type Presets = Record<NodeEnv, Preset>;

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
  htmlPluginOptions: htmlPluginMinifyOptions,
  miniCssExtractPluginOptions: {},
  modulesCssLoaderOptions: {
    modules: {
      localIdentName: "[path][name]__[local]--[hash:base64:5]",
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
