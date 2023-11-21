export type NodeEnv = "development" | "production" | "test";

export type Preset = {
  name: NodeEnv;
  tsLoaderOptions?: any;
  htmlPluginOptions?: any;
  miniCssExtractPluginOptions?: any;
  miniCssExtractLoaderOptions?: any;
  cssMinimizerPluginOptions?: any;
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

const commonPreset: Partial<Preset> = {
  // TODO (olku): add repeated properties for all presets
  tsLoaderOptions: { experimentalFileCaching: true },
  htmlPluginOptions: htmlPluginMinifyOptions,
  miniCssExtractPluginOptions: {},
};

export const KnownPresets: Presets = {
  development: {
    ...commonPreset,
    name: "development",
  },
  production: {
    ...commonPreset,
    name: "production",
  },
  test: {
    ...commonPreset,
    name: "test",
  },
} as const;
