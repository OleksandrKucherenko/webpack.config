import path from "node:path";

import type { PackageJson } from "type-fest";

import packageJsonRaw from "../package.json";
import { ensureSlash, pathname } from "./utils";
const packageJson: PackageJson = packageJsonRaw;

// listening to those env variables
const envPublicUrl = process.env.PUBLIC_URL;
const envTsConfig = process.env.TS_NODE_PROJECT;

export const paths = {
  dotenv: path.resolve(__dirname, "..", ".env"),
  appPath: path.resolve(__dirname, ".."),
  appCache: path.resolve(__dirname, "..", ".cache"),
  appBuild: path.resolve(__dirname, "..", "dist"),
  appBuildAssets: path.resolve(__dirname, "..", "dist", "static"),
  appBuildCss: path.resolve(__dirname, "..", "dist", "static", "css"),
  appBuildMedia: path.resolve(__dirname, "..", "dist", "static", "media"),
  appBuildFonts: path.resolve(__dirname, "..", "dist", "static", "fonts"),
  appPublic: path.resolve(__dirname, "..", "public"),
  appMocks: path.resolve(__dirname, "..", "mocks"),
  appConfig: path.resolve(__dirname, "..", "config"),
  appHtml: path.resolve(__dirname, "..", "public/index.html"),
  appIndexJs: path.resolve(__dirname, "..", "src/index.tsx"),
  appPackageJson: path.resolve(__dirname, "..", "package.json"),
  appSrc: path.resolve(__dirname, "..", "src"),
  appTsConfig: envTsConfig || path.resolve(__dirname, "..", "tsconfig.json"),
  appJsConfig: path.resolve(__dirname, "..", "jsconfig.json"),
  yarnLockFile: path.resolve(__dirname, "..", "yarn.lock"),
  testsSetup: path.resolve(__dirname, "..", "config", "setupTests.ts"),
  proxySetup: path.resolve(__dirname, "..", "mocks", "setupProxy.ts"),
  appNodeModules: path.resolve(__dirname, "..", "node_modules"),
  swSrc: path.resolve(__dirname, "..", "src/service-worker.ts"),
  publicUrl: envPublicUrl || packageJson?.homepage || "/",
  // We use `PUBLIC_URL` environment variable or "homepage" field to infer
  // "public path" at which the app is served.
  // Webpack needs to know it to put the right <script> hrefs into HTML even in
  // single-page apps that may serve index.html for nested URLs like /todos/42.
  // We can't use a relative path in HTML because we don't want to load something
  // like /todos/42/static/js/bundle.7289d.js. We have to know the root.
  servedPath: ensureSlash(envPublicUrl || pathname(packageJson?.homepage), true),
} as const;
