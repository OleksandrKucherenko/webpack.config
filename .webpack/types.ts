export type { PackageJson } from "type-fest";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import { Configuration } from "webpack";

export type NodeEnv = "development" | "production" | "test";

export type KnownReactAppVariables = {
  // TODO (olku): register all variable that React App expects, they all should start form REACT_APP_ prefix
  REACT_APP_CLIENT_ENVIRONMENT?: string;
};

export type InitialVariables = {
  NODE_ENV: NodeEnv;
  PUBLIC_PATH: string;
  CLIENT_ENVIRONMENT: string;
};

export type RawKeys = keyof KnownReactAppVariables | keyof InitialVariables;

export type RawVariables = Partial<Record<RawKeys, string>>;

export type Env = Partial<Record<string, string | null>>;

export type Stringified = {
  "process.env": Record<string, string>;
};

export type Defined = Record<string, string>;

export type AppEnvironment = {
  raw: RawVariables;
  stringified: Stringified;
  defined: Defined;
};

export type Preset = {
  name: NodeEnv;
  tsLoaderOptions?: any;
  esbuildLoaderOptions?: any;
  htmlPluginOptions?: any;
  miniCssExtractPluginOptions?: any;
  miniCssExtractLoaderOptions?: any;
  cssMinimizerPluginOptions?: any;
  modulesCssLoaderOptions?: {
    modules: any;
  };
  postcssLoaderOptions?: {
    postcssOptions: any;
  };
  devServerProxy?: DevServerConfiguration["proxy"];
};

export type Presets = Record<NodeEnv, Preset>;

/** Boolean flag provided by command line option: `--env production` or `--env development` */
export type WebpackCliArgs = {
  WEBPACK_BUNDLE: boolean;
  WEBPACK_BUILD: boolean;
  production?: boolean;
  development?: boolean;
} & Record<string, boolean>;

type Optimization = NonNullable<Configuration["optimization"]>;
type SplitChunks = Exclude<Optimization["splitChunks"], false | undefined>;
export type CacheGroup = NonNullable<SplitChunks["cacheGroups"]>;

type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;

export type IndexedPlugin = { index: number; plugin: Flatten<Configuration["plugins"]> };
