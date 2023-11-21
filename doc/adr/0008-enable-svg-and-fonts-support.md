# 8. Enable SVG and Fonts support

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
- used Google Fonts for testing:
  - ref: https://fonts.google.com/noto/specimen/Noto+Color+Emoji
  - ref: https://fonts.google.com/specimen/Pacifico

### Known issues

- [ ] webpack in watch mode does not detect folder `typings` files changes, so it requires restart of webpack dev server

Possible solutions:

1. move `typings` folder inside `src` folder

- [ ] font sizes are not optimized, so it requires additional optimization step

Possible solutions:

- [ ] use `fontmin-webpack` plugin
- [ ] use more web friendly fonts types, like woff2
- [x] command line tools that allows to create a subset font. `glyphhanger`, `scripts/optimize.ttf.sh`

### References

- https://stackoverflow.com/questions/41676054/how-to-add-fonts-to-create-react-app-based-projects
- https://github.com/gregberge/svgr/tree/main/packages/webpack
- https://react-svgr.com/docs/webpack/
- https://github.com/manuelbieh/react-ssr-setup
- https://www.npmjs.com/package/fontmin-webpack
- https://www.robinwieruch.de/webpack-font/
- https://stackoverflow.com/questions/62395038/how-can-i-export-only-one-character-from-ttf-woff-file-to-avoid-load-unnecessa
- https://www.afasterweb.com/2018/03/09/subsetting-fonts-with-glyphhanger/
  - https://www.sarasoueidan.com/blog/glyphhanger/
- https://github.com/google/woff2

```bash
pip install lxml unicode fonttools brotli zopfli
yarn glyphhanger \
  --whitelist="U+1F31F,U+1F334,U+1F340,U+1F344,U+1F35C,U+1F3C6,U+1F3E1,U+1F3FB,U+1F3FE,U+1F3FF,U+1F410,U+1F422,U+1F440,U+1F451,U+1F480,U+1F4F8,U+1F54A,U+1F63B,U+1F6A8,U+1F9FF,U+1FA77,U+1FABC,U+1FAE7,U+1FAF1,U+1FAF2,U+1FAF6" \
  --subset="*.ttf"

brew install fonttools
brew install woff2
```

## Dependencies

```json
{
  "devDependencies": {
    "@svgr/webpack": "^8.1.0"
  }
}
```
