#!/usr/bin/env node
/*
 * Data checks, run by tools/build.sh before it writes the pages.
 *
 *   ERROR   stops the build: the data contradicts itself in a way the app
 *           would show wrongly (a model with no parts list, a jet size the
 *           ladder does not have, a scraper model list that has drifted).
 *   WARN    printed, build continues: known gaps worth a look, such as a part
 *           number on a spec sheet that this model's diagram does not list.
 *
 * Run on its own with:  node tools/check.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const errors = [], warns = [];
const err = (m) => errors.push(m), warn = (m) => warns.push(m);

let S, P;
try { S = JSON.parse(read("data/specs.json")); }
catch (e) { console.error("ERROR data/specs.json is not valid JSON: " + e.message); process.exit(1); }
try {
  const pj = read("data/parts.js");
  P = JSON.parse(pj.slice(pj.indexOf("{"), pj.lastIndexOf("}") + 1));
} catch (e) { console.error("ERROR data/parts.js could not be parsed: " + e.message); process.exit(1); }

/* ---- models ---------------------------------------------------------------- */
const ids = new Set(), keys = new Set();
for (const m of S.models) {
  if (ids.has(m.id)) err(`duplicate model id ${m.id}`);
  ids.add(m.id); keys.add(m.partzilla);
  if (!P.m[m.partzilla]) err(`${m.code}: no parts list for "${m.partzilla}" in parts.js`);
  if (!S.tracks[m.track]) err(`${m.code}: track ${m.track} has no entry in specs.tracks`);
}
for (const k of Object.keys(P.m)) if (!keys.has(k)) err(`parts.js has "${k}", which no model in specs.json uses`);

/* ---- parts rows ------------------------------------------------------------ */
for (const [k, rows] of Object.entries(P.m)) {
  const seen = new Set();
  for (const r of rows) {
    const [si, , pn] = r.split("|");
    if (!P.s[+si]) err(`${k}: row "${r}" points at section ${si}, which does not exist`);
    if (!P.d[pn]) err(`${k}: part ${pn} has no description`);
    if (seen.has(r)) warn(`${k}: duplicate row ${r}`);
    seen.add(r);
  }
}

/* ---- model fields confirmed by that model's own diagram -------------------- */
const FIELDS = ["track", "slide", "primarySpring", "belt", "cdi", "coil", "brakeDisc"];
for (const m of S.models) {
  const pns = new Set((P.m[m.partzilla] || []).map((r) => r.split("|")[2]));
  for (const f of FIELDS) {
    if (!pns.has(m[f])) warn(`${m.code}: ${f} ${m[f]} is not on this model's scraped parts list (shown as unconfirmed)`);
  }
}

/* ---- jetting --------------------------------------------------------------- */
const C = S.carburetor, ladder = C.mainJetLadder.map((j) => j.size);
if (new Set(ladder).size !== ladder.length) err("main jet ladder has a repeated size");
for (let i = 1; i < ladder.length; i++) {
  if (parseFloat(ladder[i]) <= parseFloat(ladder[i - 1])) err(`main jet ladder is out of order at #${ladder[i]}`);
}
if (!ladder.includes(C.mainJetStd.size)) err(`standard main jet #${C.mainJetStd.size} is not on the ladder`);
for (const b of C.altitudeChart.bands) {
  for (const z of C.altitudeChart.zones) {
    if (!ladder.includes(b[z.key])) err(`altitude chart ${b.ft} ft / ${z.key}: #${b[z.key]} is not on the ladder`);
  }
}
for (const j of C.mainJetLadder) {
  if (!P.d[j.pn]) warn(`ladder #${j.size}: ${j.pn} is not in the parts index`);
  for (const a of j.alt || []) if (!P.d[a]) warn(`ladder #${j.size}: alternate ${a} is not in the parts index`);
}
/* Every catalogued main jet must be on the ladder, under its own number or as an alternate. */
const ladderPns = new Set(C.mainJetLadder.flatMap((j) => [j.pn].concat(j.alt || [])));
for (const [pn, d] of Object.entries(P.d)) {
  const mm = /JET, MAIN \(#?([\d.]+)\)/.exec(d);
  if (!mm) continue;
  if (!ladderPns.has(pn) && ladder.includes(mm[1])) err(`main jet ${pn} (#${mm[1]}) is in the parts index but not on the ladder as std or alt`);
}

/* ---- torque ---------------------------------------------------------------- */
let off = 0;
for (const g of S.torque.groups) for (const r of g.rows) {
  if (Math.abs(r.nm * 0.737562 - r.ftlb) > 1.0 && !r.ftlbMismatch) {
    err(`torque "${r.item}": ${r.nm} N·m is ${(r.nm * 0.737562).toFixed(1)} ft·lb, data says ${r.ftlb}. Fix it or mark ftlbMismatch: true until the manual is checked`);
  }
  if (r.ftlbMismatch) off++;
}
if (off) warn(`${off} torque rows have ft·lb that differs from the exact conversion; check them against the manual`);

/* ---- scraper model list matches specs.json --------------------------------- */
const scraper = read("tools/scrape-partzilla.js");
const listed = [...scraper.matchAll(/\['(\d{4})', '([^']+)'\]/g)].map((x) => x[1] + "/" + x[2]);
const want = S.models.map((m) => m.partzilla);
const missing = want.filter((k) => !listed.includes(k)), extra = listed.filter((k) => !want.includes(k));
if (missing.length || extra.length) {
  err(`tools/scrape-partzilla.js MODELS has drifted from specs.json (missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}). Run: node tools/parts.js models`);
}

/* ---- report ---------------------------------------------------------------- */
for (const w of warns) console.log("WARN  " + w);
for (const e of errors) console.log("ERROR " + e);
console.log(`checks: ${S.models.length} models, ${Object.keys(P.d).length} parts, ${errors.length} errors, ${warns.length} warnings`);
process.exit(errors.length ? 1 : 0);
