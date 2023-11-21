# 9. Enable CSS styles support

Date: 2023-11-21

## Status

Accepted

## Context

React App should be able to use CSS styles. we need support of several CSS related tools/languages/frameworks:

- [x] CSS
- [ ] SASS
- [ ] SCSS
- [ ] vanilla CSS modules

## Decision

1. Use normalize.css to reset browser styles to a consistent baseline

```bash
# install latest normalize.css
curl -O https://raw.githubusercontent.com/necolas/normalize.css/master/normalize.css
```

2. make `global.css` file for demoing the usage of CSS styles

## Consequences

- [x] import of CSS file make it embedded into HTML `<header/>` section. It become a part of final HTML file.
- `style-loader` is used for Injecting CSS into the DOM.
- `css-loader` is used for Interprets `@import` and `url()` like `import/require()` and will resolve them.
- `mini-css-extract-plugin` is used for extracting CSS into separate files. It creates a CSS file per JS file which contains CSS. It supports On-Demand-Loading of CSS and SourceMaps.
- `css-minimizer-webpack-plugin` is used for minifying CSS.

### References

- https://huantao.medium.com/how-to-host-fonts-and-icons-locally-with-webpack-f5e3d0704bd4
- https://github.com/necolas/normalize.css
- https://webpack.js.org/plugins/mini-css-extract-plugin/
  - https://github.com/webpack-contrib/mini-css-extract-plugin
- https://webpack.js.org/plugins/css-minimizer-webpack-plugin/

## Dependencies

```json
{
  "devDependencies": {
    "css-loader": "^6.8.1",
    "style-loader": "^3.3.3"
  }
}
```
