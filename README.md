# PhazerMania

A specs, parts and tuning reference for the 485 cc fan-cooled twin Yamaha snowmobiles of 1986–1995: the **Phazer**, **Phazer II** and **Venture**.

It covers 30 models with a spec sheet for each, an OEM parts index scraped from Partzilla, Yamaha's altitude and temperature jetting chart, track fitment, torque values, clutch springs, gearing, suspension setup, and what changed from year to year. Every figure says where it came from, and anything not read directly off a manual page is labelled as such.

For riders it also has:

- **Links to a sled and tab**, such as `#1992-pz480s/jetting`, to share on a forum
- **An order list**: tap **+ list** next to any part, set quantities, and copy the list for a dealer
- **A tuning log** of date, altitude, temperature, jets and plug colour, exportable as CSV
- **A printable spec card** for each sled

The order list, tuning log, last sled and jetting inputs are saved in the rider's own browser. Nothing is sent anywhere.

**Live site:** https://jfosheim.github.io/phazermania/

## Layout

| Path | What it is |
| --- | --- |
| `tools/app-body.html` | The app itself: markup, styles and all the rendering code |
| `data/specs.json` | Every spec, model and source note. The only copy; edit here |
| `data/parts.js` | The parts index: sections, part descriptions, and each model's parts |
| `data/parts-overrides.json` | Optional. Description corrections that survive a re-scrape |
| `data/diagrams.js`, `data/richs.js`, `data/richs-index.tsv` | Manifests for the offline diagram images (images are not in the repo) |
| `tools/build.sh` | Builds everything below and runs the data checks first |
| `tools/check.js` | Data checks. Errors stop the build; warnings are printed |
| `tools/parts.js` | Merges a new Partzilla scrape into `parts.js`, keeping hand edits |
| `tools/scrape-partzilla.js` | Browser-console scraper for Partzilla |
| `tools/fetch-*.sh` | Download the diagram images for local use |
| `SOURCES.md` | Which manual or source each group of figures came from |

## Building

Needs `sh` and Node 18 or later.

```sh
sh tools/build.sh
```

That writes three files, none of them committed:

- `dist/index.html`: the website, which GitHub Actions publishes on every push to `main`
- `phazermania.html`: the same page, for publishing as a Claude artifact
- `index.html`: a local build that loads `data/*.js` directly and links the offline diagrams in `data/diagrams*/` if you have downloaded them

## Updating parts data

1. Open a Partzilla catalogue page, paste `tools/scrape-partzilla.js` into the browser console, and run `await run()` then `copy(emit())`.
2. Save the clipboard to a file, for example `scrape.json`.
3. Run `node tools/parts.js merge scrape.json`. Existing descriptions are kept, and the command lists every part whose scraped description differs so you can check it.
4. Put any correction you want to keep in `data/parts-overrides.json`, then rebuild.

If you add or remove a model in `specs.json`, run `node tools/parts.js models` to update the scraper's model list.

## What is not here

The Yamaha service manuals and the exploded-diagram images are copyrighted and large, so they stay out of the repo and out of the published site. The site links to Partzilla's diagrams instead.
