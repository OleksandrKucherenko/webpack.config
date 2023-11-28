# 10. Collect metrics of the Webpack configuration

Date: 2023-11-22

## Status

Accepted

## Context

The goal is to create easy to adjust and maintainable Webpack configuration.
All changes to the configuration should be reflected in the metrics.
The metrics should be collected/reported automatically.
Expected combination of rules and approaches for developer that want to adjust the configuration and compare it to the previous version.

## Decision

1. Use `webpack-merge` to merge configuration parts
2. Use `speed-measure-webpack-plugin` to collect metrics
   - does not work with webpack 5 and mini-css-extract-plugin, requires workaround: https://github.com/stephencookdev/speed-measure-webpack-plugin/issues/167#issuecomment-1318684127
3. compose scripts for running builds with metrics collection

```bash
# measure production build compilation time
yarn measure:build

# drop cache to measure first build time (CI build time)
rm -rf .cache && yarn measure:build
```

## Consequences

## Dependencies

```json
{
  "devDependencies": {
    "@types/speed-measure-webpack-plugin": "^1.3.6",
    "speed-measure-webpack-plugin": "^1.5.0",
    "webpack-merge": "^5.10.0"
  }
}
```

### References

- https://www.npmjs.com/package/webpack-merge
  - https://github.com/survivejs-demos/webpack-demo/blob/dev/webpack.config.js
- https://github.com/stephencookdev/speed-measure-webpack-plugin
- https://www.npmjs.com/package/stats-webpack-plugin
