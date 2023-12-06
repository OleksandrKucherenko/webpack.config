import path from "node:path";

// TODO (olku): read configuration from tsconfig.json file instead

export const aliases = {
  clients: path.resolve(__dirname, "../src/clients/"),
  components: path.resolve(__dirname, "../src/components/"),
  features: path.resolve(__dirname, "../src/features/"),
  hooks: path.resolve(__dirname, "../src/hooks/"),
  src: path.resolve(__dirname, "../src/"),
};
