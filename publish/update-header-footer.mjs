#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const input = readFileSync(0, 'utf8'); // 0: stdin

const contentsStart = input.indexOf('## <a name="Contents"');
if (contentsStart < 0) throw Error("Contents link not found");
const headerEnd = input.indexOf("\n", contentsStart) + 1;
if (headerEnd <= 0) throw Error("Header end not found");

const footerStart = input.lastIndexOf('©')
if (footerStart < 0) throw Error("Footer start not found");

const headerPath = resolve("header.md");
console.log(`Writing ${headerPath}...`);
writeFileSync(headerPath, input.substring(0, headerEnd));

const footerPath = resolve("footer.md");
console.log(`Writing ${footerPath}...`);
writeFileSync(footerPath, '* * *\n\n' + input.substring(footerStart))
