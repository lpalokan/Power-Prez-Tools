// Generates manifest.prod.xml from manifest.xml by replacing the localhost
// dev URL with the public hosting URL. Run by `npm run manifest:prod` and
// automatically before `npm publish`.
//
// Base URL precedence: ADDIN_BASE_URL env var, else the default below.
// Keep DEFAULT_BASE_URL in sync with the GitHub Pages URL of this repo.

import { readFileSync, writeFileSync } from "node:fs";

const DEV_URL = "https://localhost:3000";
const DEFAULT_BASE_URL = "https://lpalokan.github.io/Power-Prez-Tools";

const baseUrl = (process.env.ADDIN_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");

const source = readFileSync("manifest.xml", "utf8");
const out = source.split(DEV_URL).join(baseUrl);

if (out === source) {
  console.warn(`Warning: "${DEV_URL}" not found in manifest.xml; nothing replaced.`);
}

writeFileSync("manifest.prod.xml", out);
console.log(`Wrote manifest.prod.xml pointing at ${baseUrl}`);
