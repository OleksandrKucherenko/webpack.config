# 7. Enabled assets support for React Project

Date: 2023-11-19

## Status

Accepted

## Context

For project required support of different images of different types:

- [x] SVG,
- [x] PNG,
- [x] WEBP,
- [x] BMP,
- [x] AVIF,
- [x] GIF,
- [x] JPG,
- [x] JPEG
- etc...

## Decision

Configure webpack Assets Management

## Consequences

- AVIF support, ref: https://github.com/facebook/create-react-app/blob/v5.0.1/packages/react-scripts/config/webpack.config.js#L364-L375
  - https://libre-software.net/image/avif-test/

```bash
-rw-r--r--@  1 o.kucherenko2  staff    21K Nov 19 22:24 sample-01.avif
-rw-r--r--@  1 o.kucherenko2  staff   8.5K Nov 19 22:28 sample-02-url.avif
```

- BMP, GIF, JPG, PNG ref: https://github.com/facebook/create-react-app/blob/v5.0.1/packages/react-scripts/config/webpack.config.js#L376-L387
- SVG support, ref: https://github.com/facebook/create-react-app/blob/v5.0.1/packages/react-scripts/config/webpack.config.js#L388-L413

  - @svgr/webpack
  - file-loader

- Fallback to file-loader, ref: https://github.com/facebook/create-react-app/blob/v5.0.1/packages/react-scripts/config/webpack.config.js#L587-L599

- Required Types for image files, declared in `typings/image.files.d.ts`

  - ref: https://stackoverflow.com/questions/52759220/importing-images-in-typescript-react-cannot-find-module

- To make webpack automatically decide which loader to use for assets left `type: "assets"`, refs:
  - https://webpack.js.org/guides/asset-modules/

> `asset` automatically chooses between exporting a data URI and emitting a separate file. Previously achievable by using url-loader with asset size limit.

- added `favicon.ico` to make html page loading clean (https://favicon.io/favicon-generator/)

### Known Issues

- [x] RESOLVED: AVIF files are not embedded into HTML when specified custom mimetype!

### References

- https://webpack.js.org/guides/asset-management/
- https://webpack.js.org/configuration/performance/
- https://css-tricks.com/enforcing-performance-budgets-with-webpack/
- https://www.contentful.com/blog/putting-your-webpack-bundle-on-a-diet/
- https://how-to.dev/how-to-speed-up-webpack-with-esbuild-loader
- https://bundlephobia.com/
-
