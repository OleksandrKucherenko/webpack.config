import har from "./utils/mocks";

export const collections = [
  {
    id: "mocks-base",
    routes: ["do-proxy:local"],
  },
  ...har,
];

export default collections;
