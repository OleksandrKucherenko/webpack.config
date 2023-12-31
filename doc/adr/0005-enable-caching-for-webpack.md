# 5. Enable caching for webpack

Date: 2023-11-18

## Status

Accepted

## Context

Webpack 5 offers strong caching support, that should allow speed up the build process.

## Decision

Required caching to reduce the build time of the project.

## Consequences

Added 'html-webpack-plugin' to generate modified index.html.

- Enabled optimization cache, split to chunks
- Enabled persistent cache
- Environment variables should invalidate the cache

### References

- https://webpack.js.org/guides/caching/
- https://github.com/webpack/changelog-v5/blob/master/guides/persistent-caching.md
- https://webpack.js.org/configuration/cache/
- https://www.npmjs.com/package/hash-wasm#benchmark
- https://segmentfault.com/a/1190000041726881/en
- https://javascript.plainenglish.io/how-to-improve-webpack-performance-7637db26fa5f
- https://medium.com/smallcase-engineering/migrating-to-webpack-5-4afb3622f43a
- https://github.com/webpack-contrib/thread-loader
- https://github.com/TypeStrong/ts-loader#experimentalfilecaching
- https://webpack.js.org/plugins/html-webpack-plugin/
- https://github.com/webpack/changelog-v5/blob/master/guides/persistent-caching.md#snapshot-types
- https://github.com/cheton/find-imports - Find all imported modules in JavaScript files. It's useful for bundling 3rd-party libraries into a vendor.js using webpack.

## Dependencies

```json
{
  "devDependencies": {
    "html-webpack-plugin": "^5.5.3",
    "rimraf": "^5.0.5"
  }
}
```
