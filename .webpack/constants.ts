import path from "node:path";

export const BUNDLE_OUTPUT_DIRECTORY = `dist`;
export const BUNDLE_OUTPUT_FILE_NAME = "[name].[contenthash].js";
export const OUTPUT_DIR = path.resolve(__dirname, "..", BUNDLE_OUTPUT_DIRECTORY);

export const ENTRY_FILE = "./src/index.tsx";

export const CACHE_DIRECTORY = ".cache";
export const CACHE_DIR = path.resolve(__dirname, "..", CACHE_DIRECTORY);
