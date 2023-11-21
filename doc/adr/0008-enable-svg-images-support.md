# 8. Enable SVG images support

Date: 2023-11-20

## Status

Accepted

## Context

For project required support of different images of different types:

- [x] SVG,
- [x] Fonts: woff, woff2, ttf, eot, otf, etc.

## Decision

- SVG support, ref: https://github.com/facebook/create-react-app/blob/v5.0.1/packages/react-scripts/config/webpack.config.js#L388-L413

  - @svgr/webpack

## Consequences

- SVG images support enabled
- SVG images as url and as React component enabled, requires two different types definitions in `typings/image.files.d.ts`

```ts
declare module "*.svg" {
  /* ...React component... */
}
declare module "*.svg?url" {
  /* ...src url... */
}
```

- For making fonts work fine, ts-loader should properly load types definitions from `typings/*.d.ts` files
- Font will be extracted by webpack to `dist/static/fonts` folder

### Known issues

- [ ] webpack in watch mode does not detect folder `typings` files changes, so it requires restart of webpack dev server

Possible solutions:

1. move `typings` folder inside `src` folder

- [ ] font sizes are not optimized, so it requires additional optimization step

Possible solutions:

- [ ] use `fontmin-webpack` plugin
- [ ] use more web friendly fonts types, like woff2

### References

- https://stackoverflow.com/questions/41676054/how-to-add-fonts-to-create-react-app-based-projects
- https://github.com/gregberge/svgr/tree/main/packages/webpack
- https://react-svgr.com/docs/webpack/
- https://github.com/manuelbieh/react-ssr-setup
- https://www.npmjs.com/package/fontmin-webpack

## Dependencies

```json
{
  "devDependencies": {
    "@svgr/webpack": "^8.1.0"
  }
}
```
