# 4. enable typescript support in webpack

Date: 2023-11-18

## Status

Accepted

## Context

`*.ts` and `*.tsx` files should be recognized well by webpack.

## Decision

Configure loaders for webpack. Enable typescript files support.

## Consequences

What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.
`src/**/*` files can be a mix of `*.{js,jsx}` and `*.{ts,tsx}` files.
