# 6. Connect React to Project

Date: 2023-11-19

## Status

Accepted

## Context

React is our major framework. So we need to enable it for project.

## Decision

React v17 should be in use

## Consequences

Connected React and React-DOM to project. Version: 17.0.2
Added typescript definitions:

- @types/react^17.0.0
- @types/react-dom@^17.0.0

Found Issues: `public/index.html` was not properly configured as template for Webpack Plugin HtmlWebpackPlugin.

Enabled JSX support for typescript compiler.

### References

- https://react.dev/learn/add-react-to-an-existing-project
- https://react.dev/learn/typescript

## Dependencies

```json
{
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "devDependencies": {
    "@types/react": "^17.0.70",
    "@types/react-dom": "^17.0.23"
  }
}
```
