import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { stringify, define } from "./utils";

import type { AppEnvironment, NodeEnv, RawVariables } from "./types";

import Debug from "debug";
const debug = Debug("webpack:config");
const dbgEnv = Debug("webpack:dotenv");

// enable environment variables injecting output
dbgEnv.enabled = true;

// listening to those env variables
export const envNode = () => process.env.NODE_ENV;
export const envNodePath = () => process.env.NODE_PATH;
export const envClientEnvironment = () => process.env.CLIENT_ENVIRONMENT;
export const envReactClientEnvironment = () => process.env.REACT_APP_CLIENT_ENVIRONMENT;
export const envInlineSize = () => process.env.IMAGE_INLINE_SIZE_LIMIT;
export const envPublicUrl = () => process.env.PUBLIC_URL;
export const envTsConfig = () => process.env.TS_NODE_PROJECT;

// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.
const REACT_APP = /^REACT_APP_/i;

export const ERROR_NODE_ENV = "The NODE_ENV environment variable is required but was not specified.";
export const ENV_FALLBACK = "development";

const initialize = (publicPath: string): RawVariables => {
  const env: RawVariables = {
    // Useful for determining whether we’re running in production mode.
    // Most importantly, it switches React into the correct mode.
    NODE_ENV: (envNode() ?? ENV_FALLBACK) as NodeEnv,
    // Useful for resolving the correct path to static assets in `public`.
    // For example, <img src={process.env.PUBLIC_PATH + '/img/logo.png'} />.
    // This should only be used as an escape hatch. Normally you would put
    // images into the `src` and `import` them in code to get their paths.
    PUBLIC_PATH: publicPath,
    // variable that allows to detect in what kind of environment we are
    CLIENT_ENVIRONMENT: envClientEnvironment() ?? ENV_FALLBACK,
    REACT_APP_CLIENT_ENVIRONMENT: envReactClientEnvironment() ?? ENV_FALLBACK,
  };

  dbgEnv("initials: %O", env);

  return env;
};

const loadDotEnvFiles = () => {
  const dotEnvPath = path.resolve(__dirname, "..", ".env");

  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  const dotenvFiles = [
    `${dotEnvPath}.${envNode()}.local`,
    `${dotEnvPath}.${envNode()}`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    envNode() !== "test" && `${dotEnvPath}.local`,
    dotEnvPath,
  ].filter(Boolean) as string[];

  // Load environment variables from .env* files. Suppress warnings using silent
  // if this file is missing. dotenv will never modify any environment variables
  // that have already been set.  Variable expansion is supported in .env files.
  // https://github.com/motdotla/dotenv
  // https://github.com/motdotla/dotenv-expand
  const loaded = dotenvFiles
    .filter((f) => fs.existsSync(f))
    .map((dotenvFile) => {
      dotenvExpand.expand(dotenv.config({ path: dotenvFile }));
      dbgEnv(`Loading %s`, dotenvFile);

      return dotenvFile;
    })
    .filter(Boolean) as string[];

  return loaded;
};

const composeNodePath = () => {
  // We support resolving modules according to `NODE_PATH`.
  // This lets you use absolute paths in imports inside large monorepos:
  // https://github.com/facebook/create-react-app/issues/253.
  // It works similar to `NODE_PATH` in Node itself:
  // https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
  // Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
  // Otherwise, we risk importing Node.js core modules into an app instead of Webpack shims.
  // https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
  // We also resolve them to make sure all tools using them work consistently.
  const appDirectory = fs.realpathSync(process.cwd());
  const newNodePath = (envNodePath() ?? "")
    .split(path.delimiter)
    .filter((folder) => folder && !path.isAbsolute(folder))
    .map((folder) => path.resolve(appDirectory, folder))
    .join(path.delimiter);

  debug(`Resolving modules, NODE_PATH = %s`, newNodePath);

  return (process.env.NODE_PATH = newNodePath);
};

export const getClientEnvironment = (publicPath: string): AppEnvironment => {
  const start = initialize(publicPath);
  const filtered = Object.fromEntries(
    Object.keys(process.env)
      .filter((key) => REACT_APP.test(key))
      .map((key) => [key, process.env[key]])
  );

  const raw = { ...filtered, ...start };
  const result = { raw, stringified: stringify(raw), defined: define(raw) };

  debug("environment: %O", raw);

  return result;
};

export default (() => {
  // critical path variable check
  if (!envNode()) throw new Error(ERROR_NODE_ENV);

  // initialization of the module
  loadDotEnvFiles();
  composeNodePath();

  return getClientEnvironment;
})();
