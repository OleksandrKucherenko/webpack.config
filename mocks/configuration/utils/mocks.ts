import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import nodeUrl from "node:url";

import type Core from "@mocks-server/core";
import type { NextFunction, Request, Response } from "express";

import Debug from "debug";
import glob from "glob";

// enable logs
const debug = Debug("mocks:har");
const dbgDuplicates = Debug("mocks:har:duplicates");
const dbgCollections = Debug("mocks:har:collections");
const dbgMiddleware = Debug("mocks:har:middleware");
const dbgRoutes = Debug("mocks:har:routes");
const LOGGERS = [dbgDuplicates, dbgCollections, dbgMiddleware, dbgRoutes];

debug.enabled = true;
// LOGGERS.map((d) => (d.enabled = true));

const root = path.resolve(__dirname, "../../..");
const fixtures = path.resolve(root, "mocks", "fixtures");
const files = glob.sync("**/mapping.json", { cwd: fixtures });

debug("found HAR mapping files: %O", files);

type HarMapping = Array<[string, string, string, ...string[]]>;

/** example: 16b19ff8-640f-4489-af03-9adff0e902da */
type UUID = `${string}-${string}-${string}-${string}-${string}`;

type Variant = {
  id: "default" | string;
  type: "json" | "text" | "status" | "middleware" | "static" | "file" | "proxy";
  options: Record<string, string | number | object> & {
    status?: number;
    body?: object;
    middleware?: (req: Request, res: Response, next: NextFunction, core: Core) => void;
    file?: string;
    proxy?: string;
  };
};

type Route = {
  id: `${string}`;
  url: string;
  method: string | string[];
  variants: [Variant, ...Variant[]];
};

type Collection = {
  id: `har:${UUID}`;
  from?: string;
  routes: string[];
};

type Converted = {
  collections: Collection[];
  routes: Route[];
};

const md5Hash = (data: string) => {
  const hash = createHash("md5");
  hash.update(data);

  return hash.digest("hex");
};

const readJsonFile = (id: UUID, file: string): object => {
  const fullPath = path.resolve(fixtures, id, file);

  const json = fs.readFileSync(fullPath, "utf8");

  try {
    return JSON.parse(json);
  } catch (e) {
    debug(`error parsing json file: %s %o`, fullPath, e);
  }

  return {};
};

const urlToRoute = (url: string): string => {
  const urlParsed = nodeUrl.parse(url);

  let finalUrl = decodeURIComponent(urlParsed.pathname ?? "");

  // replace UUID sequence by `:uuid` in the url
  // eslint-disable-next-line security/detect-unsafe-regex
  const UUID_REGEX = /[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}/gi;
  const KRN_REGEX = /krn:[a-z0-9-]+:[a-z0-9-]+:[a-z0-9-]+/gi;

  finalUrl = finalUrl.replace(KRN_REGEX, ":krn");
  finalUrl = finalUrl.replace(UUID_REGEX, ":uuid");
  finalUrl = finalUrl.replace(UUID_REGEX, ":uuid"); // possible multiple UUIDs in the url
  finalUrl = finalUrl.replace(/:uuid_:uuid/, ":twoIds");

  return finalUrl;
};

const convertMappingToRoutes = (id: UUID, mapping: HarMapping): Route[] => {
  // do not process the same file twice, mapping file do not guarantee unique routes
  const processed = new Map<string, boolean>();

  const toDefaultVariant = (status: number, file: string): Variant => ({
    id: "default",
    type: "json",
    options: { status, body: readJsonFile(id, file) },
  });

  const routes = mapping
    .filter(([_method, file, _url, _code]) => {
      if (processed.has(file)) {
        debug("file already processed: %s", file);
        return false;
      }

      processed.set(file, true);
      return true;
    })
    .map(
      ([method, file, url, status]) =>
        ({
          id: file,
          url: urlToRoute(url),
          method,
          variants: [toDefaultVariant(Number(status), file)],
        } as Route)
    );

  return routes;
};

const extractRoutesUniqueIds = (routes: Route[]): string[] => {
  return routes.map(({ id, variants: [first] }) => `${id}:${first.id}`);
};

const extractHash = (id: string): string => {
  // can be two hashes: `{query_params_hash}#{request_body_hash}`
  // examples:
  // - post.de-orders-bff-transactions-graphql-#0d6d4263.json
  // - post.5289388-envelope-3c544283#b8bf2990.json
  // - get.sc-portal-delegation-token-krn-8a004eba.json
  // we use regex to extract the hash parts
  const HASH_REGEX = /-(([a-f0-9]{8})?#?([a-f0-9]{8})?).json$/gim;

  // get the group 1 result as the hash
  const [, hash] = HASH_REGEX.exec(id) ?? [];

  return hash ?? id;
};

enum MiddlewareType {
  Hash = "hash",
  Sequence = "sequence",
}

const middlewareFnByHash =
  (lookup: Map<string, Variant>, fallback: Variant) =>
  (req: Request, res: Response, next: NextFunction, core: Core) => {
    core.logger.info("Request received!");

    try {
      // debug("request: %O", req);
      const url = nodeUrl.parse(req.url, true);
      const query = url.search ?? "";
      const body = req.body ?? "";

      // compute hash from request URL query params and body
      const qHash = query.length > 0 ? md5Hash(query).substring(0, 8) : "";
      const bHash = body.length > 0 ? md5Hash(JSON.stringify(body)).substring(0, 8) : "";
      const hash = `${qHash}` + (bHash.length > 0 ? `#${bHash}` : "");

      dbgMiddleware("hash: %s", hash);
      const variantRes = lookup.get(hash) ?? fallback;

      res.status(variantRes.options.status ?? 200);
      res.json(variantRes.options.body);
    } catch (e) {
      core.logger.error(e);
      res.status(500).json({ error: e.message, e });
    }
  };

const middlewareFnBySequence = (variants: Variant[], fallback: Variant) => {
  let index = -1;

  return (req: Request, res: Response, next: NextFunction, core: Core) => {
    core.logger.info("Request received!");

    index += 1;
    try {
      const variantRes = variants[index] ?? fallback;
      dbgMiddleware("index: %s ~> %s", index, variantRes.id);

      res.status(variantRes.options.status ?? 200);
      res.json(variantRes.options.body);
    } catch (e) {
      core.logger.error(e);
      res.status(500).json({ error: e.message, e });
    }
  };
};

const createRouter = (variants: Variant[], fallback: Variant, type = MiddlewareType.Hash): Variant => {
  const lookup = new Map<string, Variant>(variants.map((v) => [v.id, v]));

  const middleware =
    type === MiddlewareType.Hash ? middlewareFnByHash(lookup, fallback) : middlewareFnBySequence(variants, fallback);

  return {
    id: `router-${type}`,
    type: "middleware",
    options: { middleware },
  };
};

const deduplicateRoutes = (routes: Route[]): Route[] => {
  // duplicated routes should be converted to one route with multiple variants
  const uniq = new Map<string, Route[]>();

  // find duplicated routes, url+method should be unique
  routes.forEach((route) => {
    const key = `${route.method}:${route.url}`;
    const existing = uniq.get(key) ?? [];
    existing.push(route);

    if (uniq.has(key)) dbgDuplicates(`route url: %s %s`, route.url, route.id);

    uniq.set(key, existing);
  });

  // remove from uniq all routes that are not duplicated, array length should be > 1
  for (const [key, value] of uniq.entries()) {
    if (value.length === 1) uniq.delete(key);
  }

  let copy = [...routes];

  // convert duplicated routes to one route with multiple variants
  for (const [, value] of uniq.entries()) {
    const [first, ...rest] = value;

    // remove duplicated routes from source routes array
    copy = copy.filter((route) => !rest.includes(route));

    // create router variant (middleware) that will control the sequence of calls
    const [fallback] = first.variants;
    const variants = rest.map(({ id, variants: [v] }) => ({ ...v, id: extractHash(id) }));
    const sequence = createRouter(variants, fallback, MiddlewareType.Sequence);
    const router = createRouter(variants, fallback, MiddlewareType.Hash);

    // TODO (olku): bad design, object should be immutable
    first.variants = [router, sequence, fallback, ...variants];

    // print mapping
    const ids = first.variants.map(({ id }) => id);
    dbgMiddleware("%s ~> %o", first.url, ids);
  }

  copy.forEach((route) => dbgRoutes("%s ~> %s:%s", route.url, route.id, route.variants[0].id));

  return copy;
};

const convertFilesToCollections = (files: string[]): Converted => {
  const loaded = files.map((file): [Collection, Route[]] => {
    const id = path.dirname(file) as UUID;
    const onlyFile = path.basename(file);
    const mapping = readJsonFile(id, onlyFile) as HarMapping;
    const routes = deduplicateRoutes(convertMappingToRoutes(id, mapping));

    const collection = {
      id: `har:${id}`,
      routes: [...extractRoutesUniqueIds(routes)],
    } as Collection;

    dbgCollections("composed: %O", collection);
    debug("generated collection: %o", collection.id);
    debug("generated collection routes: %o", collection.routes.length);

    return [collection, routes];
  });

  const collections = loaded.map(([collection]) => collection);
  const routes = loaded.map(([, routes]) => routes).flat();

  return { collections, routes };
};

const data = convertFilesToCollections(files);
dbgCollections("generated collections: %O", data.collections);
dbgRoutes("generated routes: %O", data.routes);

export const routes = data.routes;
export const collections = data.collections;

export default data.collections;
