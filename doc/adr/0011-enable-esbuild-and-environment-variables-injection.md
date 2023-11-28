# 11. Enable esbuild and Environment variables injection

Date: 2023-11-27

## Status

Accepted

## Context

`ts-loader` demonstrates low performance for big projects. We need to find a way to improve it.

## Decision

Enable `esbuild-loader` for webpack.

## Consequences

- `esbuild-loader` is faster than `ts-loader` and `babel-loader`
- added `aliases` into separated file for easier configuration
- added `chunks` into separated file for easier configuration
- added `measuring` into separated file for easier configuration
- modified `presets` to use `esbuild-loader` instead of `ts-loader` and `babel-loader`

### References

- https://medium.com/dailyjs/inserting-variables-into-html-and-javascript-with-webpack-80f33625edc6
-
