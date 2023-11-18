## Webpack.config

## Tools

### Dev Environment Setup

- [volta](https://docs.volta.sh/guide/understanding)
- [direnv](https://direnv.net/)

## Steps

### Configure Webpack on node JavaScript base

- webpack 5 [Basic Setup](https://webpack.js.org/guides/getting-started/#basic-setup)

### Configure Typescript in solution

[Webpack Configuration](https://webpack.js.org/configuration/configuration-languages/)
[Webpack & Typescript](https://webpack.js.org/guides/typescript/)
[Webpack Integration](https://www.typescriptlang.org/docs/handbook/integrating-with-build-tools.html#webpack)

- [x] Remove '@types/webpack' ref: https://webpack.js.org/blog/2020-10-10-webpack-5-release/#typescript-typings
- [x] Examine Project: https://github.com/hungtcs-lab/webpack-typescript-starter
- [x] https://github.com/tsconfig/bases

```bash
# test typescript configuration
yarn ts-node scripts/extract.src.dependencies.ts

# test webpack configuration
yarn build
```
