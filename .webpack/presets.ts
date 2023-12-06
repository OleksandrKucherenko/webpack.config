import Debug from "debug";

import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

import * as vars from "./constants";

const proxyD = Debug("webpack-dev-server:proxy");

// alway keep proxy logs enabled
Debug.enable(proxyD.namespace);

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
  devServerProxy?: DevServerConfiguration["proxy"];
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
  esbuildLoaderOptions: {
    target: "es2015",
    tsconfig: "./tsconfig.esbuild.json",
  },
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
  devServerProxy: {
    changeOrigin: true,
    toProxy: true,
    // redirect all `/api` requests to localhost:8280 (mocks-server running on port 8280)
    "/api": {
      // ref: https://github.com/chimurai/http-proxy-middleware#nodejs-17-econnrefused-issue-with-ipv6-and-localhost-705
      target: "https://127.0.0.1:8280",
      pathRewrite: { "^/api": "" },
      secure: false,
      logLevel: "debug",
      onProxyReq: (pr, req, res) => {
        const { method, protocol, host, path } = pr;
        const transformation = `${req.originalUrl} ~> ${req.url} ~> ${protocol}//${host}:8280${path}`;
        res.setHeader("X-Debug-Proxy", transformation); // inject debug header
        proxyD("%s %s", method, transformation);
      },
      onError: (err, req, res) => {
        proxyD("%O", err);
      },
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
