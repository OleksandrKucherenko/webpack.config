import querystring from "querystring";

export const routes = [
  // fallback everything else, proxy to localhost:9000
  {
    id: "do-proxy",
    url: "*",
    method: "GET", // any method
    variants: [
      // local dev environment
      {
        id: "local",
        type: "proxy",
        options: {
          // ref: https://github.com/chimurai/http-proxy-middleware#nodejs-17-econnrefused-issue-with-ipv6-and-localhost-705
          host: "http://127.0.0.1:8282",
          options: {},
        },
      },
      // staging environment
      {
        id: "staging",
        type: "proxy",
        options: {
          host: "https://websites-gateway.nonprod.eu1.klear.klarna.net/api/sc-portal",
          // ref: https://github.com/villadora/express-http-proxy/issues/11
          options: {
            userResHeaderDecorator: () => ({ "Access-Control-Allow-Origin": "*" }), // CORS
          },
        },
      },
      // error code 404
      {
        id: "error",
        type: "status",
        options: {
          status: 404,
        },
      },
    ],
  },
];

export default routes;
