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

### References

- https://stackoverflow.com/questions/41676054/how-to-add-fonts-to-create-react-app-based-projects
- https://github.com/gregberge/svgr/tree/main/packages/webpack
- https://react-svgr.com/docs/webpack/
- https://github.com/manuelbieh/react-ssr-setup

## Dependencies

```json
{
  "devDependencies": {
    "@svgr/webpack": "^8.1.0"
  }
}
```
