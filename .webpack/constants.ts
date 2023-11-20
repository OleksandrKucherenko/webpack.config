import path from "node:path";

export const BUNDLE_OUTPUT_DIRECTORY = `dist`;
export const BUNDLE_OUTPUT_FILE_NAME = "[name].[contenthash].js";
export const OUTPUT_DIR = path.resolve(__dirname, "..", BUNDLE_OUTPUT_DIRECTORY);

export const ENTRY_FILE = "./src/index.tsx";

export const CACHE_DIRECTORY = ".cache";
export const CACHE_DIR = path.resolve(__dirname, "..", CACHE_DIRECTORY);

export const TEMPLATE_FILE = path.resolve(__dirname, "..", "public/index.html");

export const INLINE_SIZE_LIMIT = 10 * 1024;
export const MAX_INLINED_ASSET_SIZE = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || `${INLINE_SIZE_LIMIT}`);
