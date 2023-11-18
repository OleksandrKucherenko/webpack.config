import { createHash } from "node:crypto";

type Env = typeof process.env;

export const createEnvironmentHash = (env: Env) => {
  const hash = createHash("md5");
  hash.update(JSON.stringify(env));

  return hash.digest("hex");
};
