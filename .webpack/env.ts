import path from "node:path";
import fs from "node:fs";
import Debug from "debug";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { paths } from "./paths";
import * as vars from "./constants";
import { stringify, define } from "./utils";

const debug = Debug("webpack:config");

// listening to those env variables
const envNode = process.env.NODE_ENV;
const envNodePath = process.env.NODE_PATH;
const encClientEnvironment = process.env.CLIENT_ENVIRONMENT;

// TODO (olku): register all variable that React App expects, they all should start form REACT_APP_ prefix
export type KnownReactAppVariables = {
  REACT_APP_CLIENT_ENVIRONMENT?: string;
};

const initialize = (publicPath: string) => ({
  // Useful for determining whether we’re running in production mode.
  // Most importantly, it switches React into the correct mode.
  NODE_ENV: envNode || vars.ENV_FALLBACK,
  // Useful for resolving the correct path to static assets in `public`.
  // For example, <img src={process.env.PUBLIC_PATH + '/img/logo.png'} />.
  // This should only be used as an escape hatch. Normally you would put
  // images into the `src` and `import` them in code to get their paths.
  PUBLIC_PATH: publicPath,
  // variable that allows to detect in what kind of environment we are
  CLIENT_ENVIRONMENT: encClientEnvironment || vars.ENV_FALLBACK,
  REACT_APP_CLIENT_ENVIRONMENT: encClientEnvironment || vars.ENV_FALLBACK,
});

const loadDotEnvFiles = () => {
  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  const dotenvFiles = [
    `${paths.dotenv}.${envNode}.local`,
    `${paths.dotenv}.${envNode}`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    envNode !== "test" && `${paths.dotenv}.local`,
    paths.dotenv,
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

      return dotenvFile;
    })
    .filter(Boolean) as string[];

  debug(`Loading environment variables from %o`, loaded);

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
  const newNodePath = (envNodePath || "")
    .split(path.delimiter)
    .filter((folder) => folder && !path.isAbsolute(folder))
    .map((folder) => path.resolve(appDirectory, folder))
    .join(path.delimiter);

  return (process.env.NODE_PATH = newNodePath);
};

type RawKeys = keyof KnownReactAppVariables | keyof ReturnType<typeof initialize>;

export type ClientEnvironment = {
  raw: Partial<Record<RawKeys, string | undefined>>;
  stringified: ReturnType<typeof stringify>;
  defined: ReturnType<typeof define>;
};

export const getClientEnvironment = (publicPath: string): ClientEnvironment => {
  // Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
  // injected into the application via DefinePlugin in Webpack configuration.
  const REACT_APP = /^REACT_APP_/i;

  const start = initialize(publicPath);
  const filtered = Object.fromEntries(
    Object.keys(process.env)
      .filter((key) => REACT_APP.test(key))
      .map((key) => [key, process.env[key]])
  );

  const raw = { ...filtered, ...start };

  return { raw, stringified: stringify(raw), defined: define(raw) };
};

// critical path variable check
if (!envNode) throw new Error(vars.ERROR_NODE_ENV);

// initialization of the module
loadDotEnvFiles();
composeNodePath();

export default getClientEnvironment;
