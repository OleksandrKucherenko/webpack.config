import Debug from "debug";
import * as glob from "glob";
import * as fs from "node:fs";
import path from "node:path";
import type { PackageJson } from "type-fest";

import packageJson from "../package.json";

const debug = Debug("script:imports");
const p: PackageJson = packageJson;

const dependencies = p?.dependencies || {};
const devDependencies = p.devDependencies || {};

function extractImports(directory: string, extension: string): string[] {
  const imports = new Set<string>();

  // Find all TypeScript files in the provided directory
  const files = findFiles(path.join(process.cwd(), directory), extension);

  // Process each file
  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");

    const importLines = [
      ...(content.match(/(from ['"].*['"])/g) || []),
      ...(content.match(/(require\(['"`].*['"`]\))/g) || []),
      ...(content.match(/(require\.resolve\(['"`].*['"`]\))/g) || []),
    ].flat();

    debug("found import lines: %d in file: %s", importLines.length, path.relative(process.cwd(), file));

    // Process each import line
    importLines.forEach((line) => {
      const match =
        line.match(/require\(['"](.*?)['"]\)/) ||
        line.match(/require\.resolve\(['"](.*?)['"]\)/) ||
        line.match(/from ['"](.*?)['"]/);

      if (!match) return;

      const importPath = match[1];

      // Exclude src/ and relative imports
      if (!importPath.startsWith(".") && !importPath.startsWith("./") && !importPath.startsWith("../")) {
        // Exclude specific directories
        if (
          !importPath.startsWith("clients/") &&
          !importPath.startsWith("components/") &&
          !importPath.startsWith("features/") &&
          !importPath.startsWith("hooks/") &&
          !importPath.startsWith("support/") &&
          !importPath.startsWith("fixtures/") &&
          !importPath.startsWith("src/")
        ) {
          // Extract the desired part of the import path
          let extractedPath = importPath;

          if (!importPath.startsWith("@") && importPath.includes("/")) {
            // If the module doesn't start with '@' and has a '/' in its name, extract from the beginning to '/'
            extractedPath = importPath.split("/")[0];
          } else if (importPath.startsWith("@") && importPath.includes("/")) {
            // If the module starts with '@' and has a '/' in its name, extract from the beginning to the second '/'
            extractedPath = importPath.split("/", 2).join("/");
          }

          imports.add(extractedPath);
        }
      }
    });
  });

  return Array.from(imports).sort();
}

function findFiles(directory: string, extension: string): string[] {
  return glob.sync(path.join(directory, `**/*${extension}`));
}

// Default values
let directory = "{src,cypress}";
let extension = ".{ts,tsx,js,jsx}";

// Check if directory and extension are provided as arguments
if (process.argv.length > 2) directory = process.argv[2];
if (process.argv.length > 3) extension = process.argv[3];

const imports = extractImports(directory, extension);

const resolved = imports
  .map((name) => ({ [name]: dependencies[name] || devDependencies[name] || "*" }))
  .reduce((acc, curr) => ({ ...acc, ...curr }), {});

fs.writeFileSync("dist/package.imports.json", JSON.stringify({ dependencies: resolved }, null, 2));
console.log(JSON.stringify({ dependencies: resolved }, null, 2));
