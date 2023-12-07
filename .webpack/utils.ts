import { createHash } from "node:crypto";
import type { Defined, Env, Stringified } from "./types";

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

export const pathname = (url?: string, fallback: string = "/") => {
  try {
    return url ? new URL(url).pathname : fallback;
  } catch (ignored) {
    return fallback;
  }
};

// Stringify all values so we can feed into Webpack DefinePlugin
export const stringify = (raw: Env): Stringified => {
  // NOTE (olku): `raw[key]` can contain an `undefined` value
  const inJson = Object.keys(raw).reduce((env, key) => ({ ...env, [key]: JSON.stringify(raw[key]) }), {});

  return { "process.env": inJson };
};

export const define = (raw: Env): Defined =>
  Object.keys(raw).reduce((env, key) => ({ ...env, [`process.env.${key}`]: JSON.stringify(raw[key]) }), {});
