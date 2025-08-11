#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { exit } from "node:process";

const lines = readFileSync(0, "utf8").split("\n"); // 0: stdin

let i = lines.findIndex((line) => line.startsWith('## <a name="Contents"'));
if (i < 0) throw new Error("ToC start not found");
while (lines[++i] === "");

/** @type {Record<string, string[]>} */
const links = {};
let match;
while ((match = /\(#(.+?)\)$/.exec(lines[i]))) {
  const target = match[1];
  if (target in links) links[target].push(i);
  else links[target] = [i];
  ++i;
}

const n = Object.keys(links).length;
if (n < 20) throw new Error(`ToC too small: ${n} entries`);

let ok = true;
for (const a of Object.values(links)) {
  if (a.length > 1) {
    if (ok) console.error("Duplicate ToC links:");
    for (const i of a) console.error(`\tline ${i + 1}: ${lines[i]}`);
    ok = false;
  }
}
exit(ok ? 0 : 1);
