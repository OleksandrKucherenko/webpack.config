#!/usr/bin/env node --loader ts-node/esm

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import Debug from "debug";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

import type { Entry, Har } from "har-format";

// enable logs
const debug = Debug("export:har");
const dbgFlaky = Debug("export:har:flaky");
const dbgFailed = Debug("export:har:failed");
const dbgRepeat = Debug("export:har:repeat");

const LOGGERS = [dbgFailed, dbgFlaky, dbgRepeat];

debug.enabled = true;

type Url = string;
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "TRACE" | "OPTIONS";
type Status = 200 | 201 | 202 | 204 | 400 | 401 | 403 | 404 | 500 | 502 | 503 | 504;
type Lookup = Map<Method, Map<Url, Map<Status, Entry[]>>>;

const METHODS_WITH_BODY = ["POST", "PUT", "PATCH"]; // should we add OPTIONS?
const REGEX_UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

type BodyHash = { body: string; hash: string };

const readJsonFile = (fullPath: string): object => {
  const json = fs.readFileSync(fullPath, "utf8");

  try {
    return JSON.parse(json);
  } catch (e) {
    debug(`error parsing json file: %s %o`, fullPath, e);
  }

  return {};
};

const md5Hash = (data: string) => {
  const hash = createHash("md5");
  hash.update(data);

  return hash.digest("hex");
};

const computeBodyHash = (entry: Entry): BodyHash => {
  const method = entry.request.method as Method;
  if (!METHODS_WITH_BODY.includes(method)) return { body: "", hash: "" };

  const body = entry.request.postData?.text ?? "";
  if (body.length === 0) return { body, hash: "" };

  const hash = md5Hash(body).substring(0, 8);

  return { body, hash };
};

const composeLookup = (entries: Entry[]): Lookup => {
  debug("searching for unique entries...");

  const lookup = new Map<Method, Map<Url, Map<Status, Entry[]>>>();

  return entries.reduce((acc: Lookup, entry: Entry) => {
    const method = entry.request.method as Method;
    const status = entry.response.status as Status;
    // we should also check the request body and compute from it unique hash (graphql queries)
    const { hash } = computeBodyHash(entry);
    const url = entry.request.url + (hash.length > 0 ? `#${hash}` : "");

    if (hash.length > 0) dbgRepeat("%o, %s %o body hash: %s", [status], method, entry.request.url, hash);

    const methodsToUrls = acc.get(method) ?? new Map<string, Map<Status, Entry[]>>();
    const statusToEntries = methodsToUrls.get(url) ?? new Map<Status, Entry[]>();
    const subEntries = statusToEntries.get(status) ?? [];

    subEntries.push(entry);

    return acc.set(method, methodsToUrls.set(url, statusToEntries.set(status, subEntries)));
  }, lookup);
};

const convertUrlToFilename = (urlInput: string): string => {
  // Convert URL to a JSON-like format and decode
  let decodedUrl = decodeURIComponent(urlInput);

  // Remove the query part from the URL
  let baseUrl = decodedUrl.split("?")[0];
  baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash if present

  // Remove protocol, domain, and port from the URL
  let path = baseUrl.split("//")[1];
  path = path.substring(path.indexOf("/"));

  // Simplify the path
  path = path.replace("/api/", "/"); // Remove '/api/'
  path = path.replace("/v1/", "/"); // Remove 'v1' but keep 'v2' and 'v10'
  path = path.replace(/\/v1$/g, ""); // Remove '/v1' at the end of the path
  path = path.replace(/\//g, "-"); // Replace '/' with '-'

  // Replace specific data patterns in path
  path = path.replace(REGEX_UUID, "uuid");
  path = path.replace(/krn:[^:]+:[^:]+:uuid/g, "krn");
  path = path.replace(/krn:[^:]+:[^:]+:[0-9]+/g, "krn");

  // Extract query parameters and generate a hash
  let query = decodedUrl.includes("?") ? decodedUrl.split("?")[1] : "";
  const [params, bodyHash] = query.includes("#") ? query.split("#") : [query, ""];

  // If query is not empty, generate a hash
  let filename = path;
  if (params !== "") {
    const hash = md5Hash(params).substring(0, 8);
    filename += `-${hash}`; // Construct filename
    if (bodyHash.length > 0) filename += `#${bodyHash}`;
  }

  // Replace forbidden characters in filename
  filename = filename.replace(/[<>:"'`\/\\|?*]/g, "%");
  filename = filename.replace(/_/g, "-");
  filename = filename.toLowerCase();

  // Remove starting '-' in filename
  if (filename.startsWith("-")) filename = filename.substring(1);

  return `${filename}.json`;
};

const extractEntryContent = (entry: Entry): Buffer => {
  const content = entry.response.content;
  const text = content.text ?? "{}";

  if (content.encoding === "base64") {
    return Buffer.from(text, "base64");
  }

  return Buffer.from(text);
};

const reportFlaky = (lookup: Lookup) => {
  return [...lookup.keys()]
    .map((method) => {
      const methodsToUrls = lookup.get(method)!;

      return [...methodsToUrls.keys()].map((url) => {
        const codeToEntries = methodsToUrls.get(url)!;
        if (codeToEntries.size == 1) return [];

        dbgFlaky("%s %s %o", method, url, [...codeToEntries.keys()]);

        return [...codeToEntries.keys()].map((code) => codeToEntries.get(code)!);
      });
    })
    .flat(3);
};

const reportFailed = (lookup: Lookup) => {
  dbgFailed("failed entries...");

  return [...lookup.keys()]
    .map((method) => {
      const methodsToUrls = lookup.get(method)!;

      return [...methodsToUrls.keys()].map((url) => {
        const codeToEntries = methodsToUrls.get(url)!;
        if (![...codeToEntries.keys()].every((code) => code >= 400)) return [];

        dbgFailed("%o, %s %o", [...codeToEntries.keys()], method, url);

        return [...codeToEntries.keys()].map((code) => codeToEntries.get(code)!);
      });
    })
    .flat(3);
};

const reportRepeats = (lookup: Lookup) => {
  dbgRepeat("verifying repeating entries...");

  return [...lookup.keys()]
    .map((method) => {
      const methodsToUrls = lookup.get(method)!;

      return [...methodsToUrls.keys()].map((url) => {
        const codeToEntries = methodsToUrls.get(url)!;
        if (codeToEntries.size !== 1) return []; // skip all records with different response codes

        const subEntries = codeToEntries.get([...codeToEntries.keys()][0])!;
        if (subEntries.length === 1) return []; // skip all records with only one entry (no repeating

        // compare content of the entries and report only the ones that are different
        const uniq = new Set(subEntries.map((entry) => computeBodyHash(entry).hash));
        if (uniq.size !== 1) {
          dbgRepeat("x%d, %s %o %o", subEntries.length, method, url, [...codeToEntries.keys()]);
          dbgRepeat("not unique entries detected for %s %s", method, url);
        }

        // skip the first entry, we should keep only the repeating ones
        return subEntries.slice(1);
      });
    })
    .flat(3);
};

const extractFiles = (lookup: Lookup, root: string, failed: boolean) => {
  const onlySuccessCode = (code: Status) => code >= 200 && code < 300;
  const allExcludeRedirect = (code: Status) => (code >= 200 && code < 300) || code >= 400;
  const forProcessing = failed ? allExcludeRedirect : onlySuccessCode;

  return [...lookup.keys()]
    .map((method) => {
      const methodsToUrls = lookup.get(method)!;

      return [...methodsToUrls.keys()].map((url) => {
        const statusToEntries = methodsToUrls.get(url)!;
        const codes = [...statusToEntries.keys()].filter(forProcessing);

        // IF found no entries for processing
        if (codes.length === 0) {
          debug("excluded: %s %s %o", method, url, [...statusToEntries.keys()]);
          return [];
        }

        return statusToEntries.get(codes[0])![0];
      });
    })
    .flat(3)
    .map((entry) => {
      const { hash } = computeBodyHash(entry);
      const url = entry.request.url + (hash.length ? `#${hash}` : "");
      const file = `${entry.request.method.toLocaleLowerCase()}.${convertUrlToFilename(url)}`;

      const outputFile = path.resolve(path.join(root, file));

      // save response content to file
      fs.writeFileSync(outputFile, extractEntryContent(entry));

      return {
        method: entry.request.method,
        code: entry.response.status,
        file,
        url,
        outputFile,
      };
    });
};

const main = () => {
  const CMD_INFO = "Converts a HAR (Html ARchive) file to a collection of JSON files";
  const FILE_INFO = "HAR file to convert";
  const FAILED_INFO = "extract failed entries";
  const MIME_JSON = "application/json";

  const argv = yargs(hideBin(process.argv))
    .options({
      file: { describe: FILE_INFO, type: "string", demandOption: true },
      failed: { describe: FAILED_INFO, type: "boolean", default: true },
      debug: { describe: "enable debug logs", type: "boolean", default: false },
    })
    .command(["extract <file>", "$0 <file>"], CMD_INFO)
    .version("1.0.0")
    .help()
    .parseSync();

  // debug processing first
  LOGGERS.forEach((dbg) => (dbg.enabled = argv.debug));

  const { file: harFile } = argv;
  debug("processing file: %o", harFile);
  debug("include failed entries: %o", argv.failed);
  debug("enabled debug info: %o", argv.debug);

  if (!fs.existsSync(harFile)) throw new Error(`file not found: ${harFile}`);

  const har = readJsonFile(harFile) as Har;
  const root = path.dirname(harFile);
  const mappingFile = path.resolve(path.join(root, "mapping.json"));

  debug("total HAR entries: %o", har.log.entries.length);
  debug("source url: %s", har.log.pages?.[0].title ?? "unknown");

  // extract entries that has JSON as response content
  const entries = har.log.entries.filter((entry) => {
    const contentType = entry.response.content.mimeType;
    return contentType.includes(MIME_JSON);
  });

  debug('"%s" entries: %o', MIME_JSON, entries.length);

  // 1. we should left entries that has a successful response code (2xx) and output warnings for the others
  // 2. HAR file may contains multiple entries to the same URL, we should uniquely identify them
  const lookup = composeLookup(entries);

  // report flaky entries that has different status code for the same URL
  const flaky = reportFlaky(lookup);

  // report entries that has only failed response code (4xx, 5xx)
  const failed = reportFailed(lookup);

  // reports repeating entries that has the same response code (2xx)
  const repeating = reportRepeats(lookup);

  debug("detected repeated entries: %o", repeating.length);

  // extract for each unique URL the first entry that has a successful response code (2xx) into file
  const mapping = extractFiles(lookup, root, argv.failed);

  const v1Mapping = mapping.map(({ method, code, url, file }) => [method, file, url, code]);
  fs.writeFileSync(mappingFile, JSON.stringify(v1Mapping, null, 2));

  debug("mapped entries: %O", mapping.length);
  debug('output mapping file: "%s"', mappingFile);

  // extract URLs and convert them to file names
};

// entry point, run the script
main();
