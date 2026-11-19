#!/usr/bin/env node
/*
 * Maintains data/parts.js, the compact parts index the app reads.
 *
 *   node tools/parts.js models
 *       Rewrites the MODELS list in tools/scrape-partzilla.js from
 *       data/specs.json, so the scraper always fetches the models the app has.
 *
 *   node tools/parts.js merge <scrape.json>
 *       Folds a scraper run into data/parts.js. <scrape.json> is what the
 *       scraper's  copy(emit())  put on the clipboard, saved to a file.
 *
 * How a merge treats descriptions. Many descriptions in parts.js were edited by
 * hand (track sizes, "(was 8M6-...)" notes, "(3A - standard)"). A merge never
 * throws those away:
 *   1. a part number already in parts.js keeps its current description;
 *   2. a new part number takes the scraped description;
 *   3. data/parts-overrides.json is applied last and always wins.
 * Put any deliberate correction in parts-overrides.json, so it survives every
 * future merge. The merge prints every part whose scraped description differs
 * from the one kept, so supersessions and flag changes (STD / AP) can be checked.
 *
 * Rows: a model in the scrape has its rows replaced by the scraped ones. A model
 * that is not in the scrape keeps its rows untouched.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const P_FILE = path.join(root, "data/parts.js");
const O_FILE = path.join(root, "data/parts-overrides.json");
const S_FILE = path.join(root, "data/specs.json");
const SCRAPER = path.join(root, "tools/scrape-partzilla.js");

const HEADER = `/* Yamaha Phazer / Phazer II / Venture OEM parts index, 1986-1995.
 * Scraped from partzilla.com with tools/scrape-partzilla.js, folded in with
 * tools/parts.js merge, and corrected by data/parts-overrides.json.
 *
 * Shape:
 *   s = section names, indexed
 *   d = part number -> description. Suffixes carry meaning:
 *         "UR STD" / "U.R. STD" / "STD"  = the factory-standard item
 *         "AP" / "ALT. PART"             = alternate / optional part
 *         "UR" / "U.R."                  = usable replacement
 *   m = "<year>/<partzilla-slug>" -> ["<sectionIdx>|<diagramRef>|<partNo>", ...]
 *
 * Loaded via <script src> so it works from file:// (fetch() does not).
 */
window.PARTS = `;

function loadParts() {
  const t = fs.readFileSync(P_FILE, "utf8");
  return JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
}

/* Same layout as the file has always had: one line per model, so diffs stay readable. */
function writeParts(P) {
  const lines = [];
  lines.push("{");
  lines.push('"s":' + JSON.stringify(P.s) + ",");
  lines.push('"d":' + JSON.stringify(P.d) + ",");
  lines.push('"m":{');
  const ks = Object.keys(P.m);
  ks.forEach((k, i) => lines.push(JSON.stringify(k) + ":" + JSON.stringify(P.m[k]) + (i < ks.length - 1 ? "," : "")));
  lines.push("}");
  lines.push("}");
  fs.writeFileSync(P_FILE, HEADER + lines.join("\n") + ";\n");
}

function models() {
  const S = JSON.parse(fs.readFileSync(S_FILE, "utf8"));
  const body = S.models.map((m) => {
    const [y, slug] = m.partzilla.split("/");
    return `  ['${y}', '${slug}'],`;
  }).join("\n");
  const src = fs.readFileSync(SCRAPER, "utf8");
  const out = src.replace(/const MODELS = \[[\s\S]*?\n\];/, "const MODELS = [\n" + body + "\n];");
  if (out === src) { console.log("scraper MODELS already matches specs.json"); return; }
  fs.writeFileSync(SCRAPER, out);
  console.log(`scraper MODELS rewritten: ${S.models.length} models`);
}

function merge(file) {
  const scrape = JSON.parse(fs.readFileSync(file, "utf8"));
  const P = loadParts();
  const O = fs.existsSync(O_FILE) ? JSON.parse(fs.readFileSync(O_FILE, "utf8")) : {};
  const added = [], differs = [];

  for (const [key, rows] of Object.entries(scrape)) {
    if (!P.m[key]) console.log(`note: ${key} is new to parts.js; add it to specs.json too`);
    const out = [];
    for (const r of rows) {
      let si = P.s.indexOf(r.section);
      if (si < 0) { P.s.push(r.section); si = P.s.length - 1; }
      const desc = r.desc.replace(/\s+/g, " ").trim();
      if (!(r.pn in P.d)) { P.d[r.pn] = desc; added.push(`${r.pn}  ${desc}`); }
      else if (P.d[r.pn] !== desc && !(r.pn in O)) differs.push(`${r.pn}\n    kept:    ${P.d[r.pn]}\n    scraped: ${desc}`);
      const row = `${si}|${r.ref}|${r.pn}`;
      if (!out.includes(row)) out.push(row);
    }
    if (out.length) P.m[key] = out;
    else console.log(`warn: ${key} came back with no rows; kept its old rows`);
  }
  for (const [pn, d] of Object.entries(O)) if (!pn.startsWith("_")) P.d[pn] = d;

  writeParts(P);
  console.log(`merged ${Object.keys(scrape).length} models; ${added.length} new parts`);
  added.forEach((a) => console.log("  + " + a));
  if (differs.length) {
    console.log(`\n${differs.length} parts kept their current description although the scrape differs. Check these for supersessions or flag changes, and move any you want into data/parts-overrides.json:`);
    differs.forEach((d) => console.log("  " + d));
  }
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "models") models();
else if (cmd === "merge" && arg) merge(arg);
else if (cmd === "format") { writeParts(loadParts()); console.log("parts.js rewritten"); }
else { console.log("usage: node tools/parts.js models | merge <scrape.json> | format"); process.exit(1); }
