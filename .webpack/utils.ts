import { createHash } from "node:crypto";

type Env = typeof process.env;

export const createEnvironmentHash = (env: Env) => {
  const hash = createHash("md5");
  hash.update(JSON.stringify(env));

  return hash.digest("hex");
};

export const ensureSlash = (inputPath: string, needsSlash: boolean): string => {
  const hasSlash = inputPath.endsWith("/");

  // remove slash if it's not needed
  if (hasSlash && !needsSlash) {
    return inputPath.substring(0, inputPath.length - 1);
  }

  // add slash if it's needed
  if (!hasSlash && needsSlash) return `${inputPath}/`;

  // return as-is
  return inputPath;
};

export const pathname = (url?: string, fallback: string = "/") => (url ? new URL(url).pathname : fallback);

type Stringified = {
  "process.env": Record<string, string>;
};

// Stringify all values so we can feed into Webpack DefinePlugin
export const stringify = (raw: Record<string, string | undefined>): Stringified => {
  // NOTE (olku): `raw[key]` can contain an `undefined` value
  const inJson = Object.keys(raw).reduce((env, key) => ({ ...env, [key]: JSON.stringify(raw[key]) }), {});

  return { "process.env": inJson };
};
