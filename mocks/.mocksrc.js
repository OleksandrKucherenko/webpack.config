// For a detailed explanation regarding each configuration property, visit:
// https://www.mocks-server.org/docs/configuration/how-to-change-settings
// https://www.mocks-server.org/docs/configuration/options

module.exports = {
  // Log level. Can be one of silly, debug, verbose, info, warn or error
  log: "info",
  config: {
    // Allow unknown arguments
    allowUnknownArguments: false,
  },
  plugins: {
    // Plugins to be registered
    //register: [],
    proxyRoutesHandler: {},
    adminApi: {
      // Port number for the admin API server to be listening at
      port: 9280,
      // Host for the admin API server
      //host: "0.0.0.0",
      https: {
        // Use https protocol or not
        enabled: true,
        // Path to a TLS/SSL certificate
        cert: "./certs/local.dev+8.pem",
        // Path to the certificate private key
        key: "./certs/local.dev+8-key.pem",
      },
    },
    inquirerCli: {
      // Start interactive CLI or not
      enabled: process.env.CI === "1" ? false : process.stdout.isTTY,
      // Render emojis or not
      emojis: true,
    },
    openapi: {
      collection: {
        // Name for the collection created from OpenAPI definitions
        //id: "openapi",
        // Name of the collection to extend from
        //from: undefined,
      },
    },
  },
  mock: {
    routes: {
      // Global delay to apply to routes
      //delay: 0,
    },
    collections: {
      // Selected collection
      // selected: "mocks-base",
      selected: "har:16b19ff8-640f-4489-af03-9adff0e902da",
    },
  },
  server: {
    // Port number for the server to be listening at
    port: 8280,
    // Host for the server
    //host: "0.0.0.0",
    cors: {
      // Use CORS middleware or not
      //enabled: true,
      // Options for the CORS middleware. Further information at https://github.com/expressjs/cors#configuration-options
      //options: {"preflightContinue":false},
    },
    jsonBodyParser: {
      // Use json body-parser middleware or not
      //enabled: true,
      // Options for the json body-parser middleware. Further information at https://github.com/expressjs/body-parser
      //options: {},
    },
    urlEncodedBodyParser: {
      // Use urlencoded body-parser middleware or not
      //enabled: true,
      // Options for the urlencoded body-parser middleware. Further information at https://github.com/expressjs/body-parser
      //options: {"extended":true},
    },
    https: {
      // Use https protocol or not
      enabled: true,
      // Path to a TLS/SSL certificate
      cert: "./certs/local.dev+8.pem",
      // Path to the certificate private key
      key: "./certs/local.dev+8-key.pem",
    },
  },
  files: {
    // Allows to disable files load
    enabled: true,
    // Define folder from where to load collections and routes
    path: "configuration",
    // Enable/disable files watcher
    watch: true,
    babelRegister: {
      // Load @babel/register
      enabled: true,
      // Options for @babel/register
      //options: {},
    },
  },
  variantHandlers: {
    // Variant Handlers to be registered
    //register: [],
  },
};
