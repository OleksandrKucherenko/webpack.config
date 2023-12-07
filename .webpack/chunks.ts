import { CacheGroup } from "./types";

export const chunkGroups: CacheGroup = {
  default: false,
  bubble: {
    name: "bubble",
    test: /\/(@klarna\/bubble-ui|@bubble-ui|@bubble-contrib)\//,
    enforce: true,
    chunks: "all",
  },
  vendor: {
    test: /[\\/]node_modules[\\/]/,
    name: "vendors",
    chunks: "all",
  },
};
