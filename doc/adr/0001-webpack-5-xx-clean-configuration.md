# 1. Webpack 5.xx clean configuration

Date: 2023-11-18

## Status

Accepted

## Context

Create an empty project to experiment with the webpack 5.x configuration and step-by-step enable features required for migration

## Decision

start from scratch, based only on tools documentation, collect as much as possible information about configuration steps.

- webpack 5 [Basic Setup](https://webpack.js.org/guides/getting-started/#basic-setup)

## Consequences

configuration will require multiple iterations, before it becomes a replacer for webpack 4.xx config

Critical:

- provide `--env production` and `--env development` to webpack cli

## Dependencies

```json
{
  "scripts": {
    "build": "NODE_ENV=production webpack --env production",
    "start": "NODE_ENV=development webpack serve --env development --open"
  },
  "devDependencies": {
    "cross-env": "^7.0.3",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1"
  }
}
```

## References

- https://github.com/facebook/create-react-app/blob/v5.0.1/packages/react-scripts/config/webpack.config.js
