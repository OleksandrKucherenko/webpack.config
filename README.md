## Webpack.config

## Tools

### Dev Environment Setup

- [volta](https://docs.volta.sh/guide/understanding)
- [direnv](https://direnv.net/)

## Steps

### [0001-use-webpack-for-bundling](doc/adr/0001-use-webpack-for-bundling.md)

### [0002-start-from-node-18-lts](doc/adr/0002-start-from-node-18-lts.md)

### [0003-typescript-enabled-solution](doc/adr/0003-typescript-enabled-solution.md)

```bash
# test typescript configuration
yarn ts-node scripts/extract.src.dependencies.ts

# test webpack configuration
yarn build
```
