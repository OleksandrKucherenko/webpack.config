# 3. Typescript Enabled solution

Date: 2023-11-18

## Status

Accepted

## Context

Enable typescript support for most tools in the project. `*.ts` files should become executable.

## Decision

added dependencies:

- typescript 5.xx
- ts-node
- @tsconfig/node18, https://github.com/tsconfig/bases
- @types/node

added additional types definitions:

- @types/webpack-dev-server
- Removed '@types/webpack' ref: https://webpack.js.org/blog/2020-10-10-webpack-5-release/#typescript-typings

## Consequences

To verify the configuration added small test script, that added additional dependencies:

- debug
- glob
- type-fest

tsconfig.json is not complete, and will require additional changes.

Notes:

- https://github.com/tsconfig/bases - contains configuration for react-app, cypress, node18, etc.
- We will continue using this package for other steps.

[Webpack Configuration](https://webpack.js.org/configuration/configuration-languages/)
[Webpack & Typescript](https://webpack.js.org/guides/typescript/)
[Webpack Integration](https://www.typescriptlang.org/docs/handbook/integrating-with-build-tools.html#webpack)

- [x] Examine Project: https://github.com/hungtcs-lab/webpack-typescript-starter

[tsconfig-paths](https://github.com/dividab/tsconfig-paths) - https://www.npmjs.com/package/tsconfig-paths not included, but can be added later.
ref: https://webpack.js.org/configuration/configuration-languages/#typescript

resolution was found by [link](https://webpack.js.org/api/cli/#troubleshooting)

### References

- https://github.com/webpack/webpack-cli/issues/2458#issuecomment-1157987399
