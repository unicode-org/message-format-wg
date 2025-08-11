#!/usr/bin/env node

import { readFileSync } from "node:fs";

// order matters here
const parts = {
  header: "header.md",
  intro: "../spec/intro.md",
  syntax: "../spec/syntax.md",
  abnf: "../spec/message.abnf",
  formatting: "../spec/formatting.md",
  errors: "../spec/errors.md",
  functions: "../spec/functions/README.md",
  stringFunctions: "../spec/functions/string.md",
  numberFunctions: "../spec/functions/number.md",
  datetimeFunctions: "../spec/functions/datetime.md",
  uNamespace: "../spec/u-namespace.md",
  datamodel: "../spec/data-model/README.md",
  json: "../spec/data-model/message.json",
  appendices: "../spec/appendices.md",
  footer: "footer.md",
};

for (const [name, path] of Object.entries(parts)) {
  parts[name] = readFileSync(path, "utf8").trim();
}

parts.abnf = "## message.abnf\n\n```abnf\n" + parts.abnf + "\n```";
parts.json = "### message.json\n\n```json\n" + parts.json + "\n```";

// Strip title + table of contents
const introStart = parts.intro.indexOf("## Introduction");
if (introStart < 0) throw new Error("Intro start not found");
parts.intro = parts.intro.substring(introStart);

parts.functions = parts.functions.replace(
  /^#+ Table of Contents\n\n(.*?)\n\n/ms,
  ""
);

const result = Object.values(parts)
  .join("\n\n")
  .replace(/ +$/gm, "")
  .replace(/\n{3,}/g, "\n\n")
  .replace(/\[(.+?)\]\((.+?)\)/g, fixLink);
console.log(result);

/**
 * @param {string} link
 * @param {string} label
 * @param {string} target
 */
function fixLink(link, label, target) {
  if (target === "../docs/why_mf_next.md") return label;
  if (target.endsWith("message.abnf")) return `[${label}](#messageabnf)`;
  if (target.endsWith("message.abnf")) return `[${label}](#messageabnf)`;
  if (target.endsWith("syntax.md")) return `[${label}](#syntax)`;
  const local = /^(?:\.\/)?[\w./]+\.md(#.+)/.exec(target);
  if (local) return `[${label}](${local[1]})`;
  const tr35 = /\/(tr35(?:-\w+)?)\.html(#.+)?$/.exec(target);
  if (tr35) return `[${label}](${tr35[1]}.md${tr35[2]})`;
  return link;
}
