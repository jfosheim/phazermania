# PhazerMania: notes for Claude

- Scope is fixed: 1986–1995 Yamaha Phazer, Phazer II and Venture, the 485 cc fan-cooled twin. Do not add other families (PZ50, Exciter, V-Max) without the owner asking.
- Edit `tools/app-body.html` and `data/specs.json`. Never edit `data/specs.js`, `index.html`, `phazermania.html` or `dist/`; `tools/build.sh` generates them.
- Run `sh tools/build.sh` before every commit. It runs `node tools/check.js`, which fails on data errors.
- Provenance matters more than completeness. Any figure not read off a manual page for that exact model must be labelled (the `specSource` field, an "unconfirmed" tag, or a warning). Never present an assumed or forum-reported number as factory data.
- Keep the app a single self-contained page with no build dependencies beyond `sh` and Node. It must work over `file://` (local build), as a Claude artifact, and on GitHub Pages.
- Test at 390 px wide as well as desktop: riders use it on a phone in the garage.
- Manuals and diagram images are copyrighted. Never commit them or embed them in the published page.
- Open changes as pull requests against `main`; a push to `main` publishes the site.
