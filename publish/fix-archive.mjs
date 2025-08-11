#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const path = "dist/index.html";

const html = readFileSync(path, "utf8")
  .replace(/<script .*googletagmanager\.com.*\s*/, '')
  .replace('href="../reports-v2.css"', 'href="css/reports-v2.css"')
  .replaceAll(
    '<a href="tr35',
    '<a href="https://www.unicode.org/reports/tr35/dev/tr35'
  );

writeFileSync(path, html)
