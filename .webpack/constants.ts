import Debug from "debug";
import { paths } from "./paths";
import { envInlineSize } from "./env";
import type { NodeEnv } from "./types";

const debug = Debug("webpack:config");

export const ENVIRONMENTS: NodeEnv[] = ["development", "production"];
export const ERROR_NO_ENV_FLAGS =
  "No environment flags were provided. " +
  "Please provide one of the following: `--env development` OR `--env production`";

export const BUNDLE_OUTPUT_FILENAME = "[name].[contenthash].js";
export const BUNDLE_ASSETS_FILENAME = "static/media/[name].[hash][ext]";
export const BUNDLE_FONTS_FILENAME = "static/fonts/[name].[hash][ext]";
export const BUNDLE_CSS_FILENAME = "static/css/[name].[contenthash].css";
export const BUNDLE_CSS_CHUNK_FILENAME = "static/css/[name].[contenthash].chunk.css";
export const BUNDLE_CSS_LOCAL_INDENT_NAME = "[path][name]__[local]--[hash:base64:5]";

export const INLINE_SIZE_LIMIT = 10 * 1024;
export const MAX_INLINED_ASSET_SIZE = parseInt(envInlineSize() || `${INLINE_SIZE_LIMIT}`);

export const report = () => {
  // Dump important configuration values
  debug('output directory: "%s"', paths.appBuild);
  debug('cache directory: "%s"', paths.appCache);
  debug("inlining images up to %s bytes", MAX_INLINED_ASSET_SIZE);
  debug("entry file: %s", paths.appIndexJs);
  debug("index.html template file: %s", paths.appHtml);
};
