# Source review — Yamaha Phazer / Phazer II / Venture spec sheet

Range: **1986–1995** (Partzilla's catalog starts at 1986; the Phazer launched 1984).

## Primary sources — manuals (added 2026-09-08)

| Source | Covers | What it gave | Where |
|---|---|---|---|
| **Sectioned Clymer-style manual, PZ480 + EX570 1984–1989** | Phazer 1984–89 | Compression 7.0:1, head volume, plug gap, timing, capacities, engagement/shift RPM, V-belt dimensions, track deflection, toe-out, brake limits, and the full Table 1 carburettor spec | `Manual/Yamaha/YAMAHA 1984-1989.zip` |
| **Yamaha factory LIT-12618-PZ-50, 1990–1996 Phazer II** | Phazer II 1990 (PZ480P / PZ480EP) | Maintenance Specifications p.8-5: complete carburettor spec **and Yamaha's own altitude × temperature main-jet chart** | zenitram-inc.com/phazer.htm (scanned pages) |

### What the manuals confirmed
Every figure I had previously derived from Partzilla and forums held up:

- **Bore × stroke 72.0 × 59.6 mm**, 485 cc — matches
- **Main jet #143.8, pilot #95** — matches Partzilla's "STD" flags exactly
- **Track 2,944 mm (115.9 in), 64 mm (2.52 in) pitch × 46 windows** — matches the 116"/2.52" figures
- **NGK BR9ES** — matches

### The one thing I had wrong
I previously flagged Partzilla showing the *same* main jet and carburettor part numbers for every year 1986–1995 as suspicious, and warned it might be a supersession artifact hiding year-to-year changes. **It is not.** The 1984–89 manual and the 1990 factory manual both specify Mikuni **B38-32**, main **#143.8**, pilot **#95**, pilot screw **1½ turns out**. The carburettor genuinely did not change. That caveat has been removed.

### Model/year scoping — the actual correction
The tool previously applied one engine/carburettor/service block to all 30 models. It now records, per model, which manual its figures came from:

- `clymer8489` — **Phazer 1986–1989.** Read directly from tables covering this model.
- `factory9096` — **Phazer II 1990.** Read from the PZ480P/PZ480EP page.
- `assumed` — **Phazer II 1991–1995.** No manual page checked for these years. Same carburettor and jetting part numbers as 1990, and the carburettor is confirmed unchanged 1984→1990, so very likely right — but inherited, not read.
- `venture` — **Venture VT480, all years.** Same 485 twin and same carburettor part numbers, so engine and jetting should hold. **There is no VT480 manual in the local set.** Clutching, gearing and suspension are a touring setup and are *not* verified.

### Two charts that disagree
The Clymer high-altitude chart for PZ480 uses round jet numbers (#145 / #140 / #135 / #130 / #125 / #120). Yamaha's own chart for PZ480P uses the precise ladder (#152.5 / #150 / #147.5 / #143.8 / #138.8 / #136.3 / #131.3 / #126.3 / #121.3). **The tool uses Yamaha's**, since it is the factory document and its values land exactly on catalogued part numbers.

### Density maths vs. the factory table
The air-density calculator built earlier was checked against Yamaha's chart and tracks it closely — sea level/32 °F lands on the standard #143.8 both ways, and 2,000–4,000 ft comes out within one rung. The calculator is now demoted to a **cross-check** for conditions falling between bands; the table is the answer.

### Not usable
`Manual/Yamaha/Yamaha 1984-1999 Phazer.ZIP` contains a 111 MB, 567-page PDF, but it is scanned images — the only text layer is the seller's advertising pages. It also exceeds the 100 MB limit for direct reading, and no PDF splitting tool (qpdf, ghostscript, pdfseparate) is installed. It would need OCR to be searchable.

`Manual/3e38da.pdf` is the modern PZ50RTZ four-stroke owner's manual — wrong era.

## Parts and diagrams

| Source | What it gives | Access |
|---|---|---|
| **Partzilla OEM catalog** | Per-model-year part numbers with an explicit **"STD"** flag on the factory-standard item. 30 models × 16 sections = 2,785 rows, 201 unique parts. | 403s plain HTTP; works through a real browser. See `tools/scrape-partzilla.js`. |
| **Partzilla diagrams** | 433 exploded diagrams, native PNG ~759×1051. | `tools/fetch-diagrams.sh` → `data/diagrams/`. Watermarked and carrying Yamaha's copyright notice, so kept local and deliberately excluded from the published artifact. |

## Torque specs and clutch springs (added 2026-09-08)

**Torque** — 54 fastener specs across five groups (engine, clutches/drive, chaincase/brake/driveshaft, track/rear suspension, steering/front suspension), plus the seven crankshaft dimensional limits.

The scanned tables suffer the same two-column OCR drift as the rest of the Clymer set, where the N·m and ft·lb columns slide relative to their labels. **The unit conversion resolves it**: 1 N·m = 0.7376 ft·lb, so only one pairing of the two columns is self-consistent. Every pair in the tool was checked this way and all of them convert. Where OCR order and physical plausibility disagreed, the conversion check settled it — the same trap that caught me earlier on the throttle valve.

Two things worth knowing:

- **The primary sheave bolt is a two-stage procedure**, which is why the table only says "see text": torque to 120 N·m (85 ft·lb) to seat the sheave on the crankshaft, back it off completely, then retighten to 60 N·m (43 ft·lb).
- **Spider to sheave is 200 N·m (145 ft·lb)** — far higher than anything else on the sled, and corroborated by the EX570 table carrying the identical figure.

`PhazerCrank.jpg` on zenitram is a clean scan of Tables 3 and 4 and needed no reconstruction.

**Springs** — from **Yamaha Technical Bulletin S88-007** (9 Sept 1988), "All Models: Primary and Secondary Clutch Spring Information", pages 1–3 on zenitram. Page 2 is badly degraded; the PZ480 rows were recovered by cropping and contrast-stretching the region in a canvas rather than trusting the first read.

| Spring | Part number | Rate | Colour |
|---|---|---|---|
| Primary, standard | 90501-52798-00 | 1.88 kg/mm | Red-Blue |
| Primary, PZ480H hi-alt | 90501-520A2-00 | 1.91 kg/mm | Yellow-Orange |
| Primary, PZ480J hi-alt | 90501-555A0-00 | 2.85 kg/mm | White-Lt Green |
| Secondary, standard | 90508-50654-00 | 11.2 kg/mm | Yellow-Blue |

> **Unresolved conflict.** Partzilla lists **90501-45534-00** as the primary spring for the 1986–89 Phazer. That number appears **nowhere** in bulletin S88-007, whose PZ480 primary is **90501-52798-00**. One is a supersession the other doesn't reflect. Measure free length and wire diameter of what's actually in the clutch before ordering. Surfaced in the tool rather than silently resolved.

Secondary spring rates marked `*` in the bulletin are kg·mm/rad (torsional), not kg/mm — not comparable to the primary column.

## High-altitude & suspension chapter (added 2026-09-08)

All 21 `HiAltSusp` pages read — Chapter Four, pages 114–134. Pages 4, 7, 8, 16 and 20 are EX570 content and do not apply; page 3 duplicates `PMpage116.jpg`.

**The two headline findings, both of which cut against expectation:**

1. **The Phazer's entire high-altitude clutch change is one part.** Table 3 lists engagement rpm, shift rpm, clutch weights (`8V0-17632-00`) and the secondary spring as *identical* to standard. Only the primary spring changes: `90501-52798` red-blue, 25.8 kg → `90501-520A2` yellow-orange, 35.5 kg.
2. **The Phazer's gearing does not change for altitude at all.** The chapter text on p.125 says elevation above 6,000 ft "will require a gear change… refer to Table 6" — but Table 6 lists the PZ480's high-altitude gearing as 29/17, 64 links, *the same as standard*. Only the EX570 actually re-gears. Re-gear the Phazer for terrain and snow, not elevation.

**Table 3 independently confirms bulletin S88-007** — same part numbers, same 25.8 / 35.5 kg set weights, same colours. The primary-spring conflict is now 2-to-1 against Partzilla's `90501-45534-00`.

**A new, smaller conflict:** the bulletin calls the PZ480 secondary spring (`90508-50654-00`) yellow-blue; Table 3 calls it white. Identify it by the twist angle Table 3 gives — 60 degrees (B-1) — rather than by colour.

**Table 4 gear ratio chart** captured as a full matrix (drive 15–22T × driven 29/31/33/35T). Ratios are computed rather than transcribed, since driven ÷ drive is exact arithmetic and the scan is poor. The standard 17/29 = 1.706 with a 64-link chain is now confirmed three ways: Table 4, Table 6 and the Partzilla chaincase listing. Chain-link counts for the *other* combinations come off that poor scan and are flagged in the tool as measure-first.

**Suspension setup** — six adjustments with their standard positions: front stopper band (hole 3 of 5), rear stopper band (hole 1), front and rear spring preload cams (position 2 of 3 each), main arm (upper hole), rear linkage arm (hole 3 of 3).

**Carburettor tuning gotchas worth naming:**

- It is a pilot **air** screw, not a fuel screw. **Clockwise leans, counter-clockwise richens** — the opposite of what most people assume.
- The manual warns that running the engine **without the air box or silencer fitted can cause engine seizure.** Worth weighing against the forum advice to gut the airbox for a VMax carburettor swap.
- Mains can be swapped through the float bowl **drain plug** without pulling the bowl.
- Factory baseline stated outright: the PZ480 carbs are jetted for **sea level at 32 to −4 °F (0 to −20 °C)**, and power falls about **3% per 1,000 ft**.

**Table 1 (p.130) is a clean scan of the PZ480 carburettor spec** and confirms throttle valve **#120** and starter jet **2.0** for the third independent time. My original sequential OCR reading was right; the "physically plausible" reordering I briefly proposed was wrong.

## Rich's Yamaha fiches (added 2026-10-14)

`tools/fetch-richs.sh` → **1,127 fiches, 31 MB, across all 30 models and 58 distinct sections**, in `data/diagrams-richs/` with `data/richs-index.tsv` and the generated `data/richs.js` manifest.

Why this source is easier than Partzilla:

- The fiche is a CSS background image at a completely predictable URL — `https://cdpcdn.dx1app.com/fiche-section-images/<section-uuid>.gif` — and the UUID is the last segment of the section page URL.
- It answers a **plain curl**. Partzilla 403s and needs a real browser.
- Its model slugs are **identical** to Partzilla's, so models map one-to-one with `data/parts.js`. One exception: 1992 Venture XL is `venture-xl-vt480s` here against Partzilla's bare `vt480s`, handled by a slug override in the script.

**An important correction to the premise.** Rich's does not have diagrams Partzilla lacks. Partzilla almost certainly has them too — *our scraper was only ever told to fetch 16 sections* (`SECTIONS` in `tools/scrape-partzilla.js`), chosen by keyword for mechanically relevant parts. The 58 sections here are what a model actually has. So this closed a gap of our own making, not a gap in Partzilla.

On image quality Partzilla is in fact slightly **better**: 759×1051 PNG against Rich's 642×1024 GIF. Both are kept — the parts index still links the Partzilla PNG where one exists, and the new "Exploded diagrams" section lists every section's fiche, marking the ones with no scraped parts list.

Sections gained that matter mechanically: crankcase, engine bracket, control cable, pump drive gear, starter, starting motor, steering, steering gate, generator, fuel tank, oil tank, air shroud–fan, track drive 2. The rest are body and trim (bumper, seat, windshield, luggage box, headlight, taillight, meter, instrument panel).

28 of 1,155 section URLs have no fiche image on the CDN; the script records the miss and carries on. Both passes resume, so re-running is nearly free.

Same copyright position as before: watermarked Yamaha illustrations, kept local, deliberately excluded from the published artifact.

## Phase 2: checked against the factory manuals (2026-11-19)

The 111 MB compiled *1984-1999 Yamaha Phazer 480 Series Service Manual* (567 scanned pages, no text layer) was read page by page from images. It holds four Yamaha documents: the 1984-89 PZ480 factory manual (pp.3-156), the 1990 PZ480P/EP manual LIT-12618-PZ-50 (pp.197-488), and supplements for 1991 PZ480R/ER/STR (pp.490-518), 1993 PZ480T/ET/STT (pp.520-535) and 1996 (pp.537-566). PDF page numbers are given here; the printed page is in the data.

**Torque, the 11 "3% low" rows.** Not misreadings. Yamaha's own PZ480 table (p.8-8, PDF p.127) gives N-m, m-kg and ft-lb, and Yamaha works in m-kg: N-m is printed as m-kg x 10 and ft-lb as m-kg x 7.2. So 6.0 m-kg is printed as 60 N-m and 43 ft-lb. The data keeps the printed values, adds the m-kg column where the factory table gives it, and `tools/check.js` now accepts either the exact conversion or Yamaha's rule. Two real corrections came out of it:
- Primary sheave bolt, seating step: the Clymer and Yamaha's 1990 manual print 85 ft-lb; the 1993 supplement prints 120 N-m (12 m-kg, 87 ft-lb). Now 87, with the difference noted.
- Slide rail suspension mounting bolts: Clymer prints 70 N-m; Yamaha's table and the 1991 supplement print 69 N-m (6.9 m-kg, 50 ft-lb). Now 69.

**Jetting baseline conflict, closed.** Both manuals were right for their own years. Yamaha's 1984-89 chart (p.8-5, PDF p.124) uses round jets and overlapping arrows, and puts the stock #143.8 at sea level from about -25 to 15 C, which contains the Clymer text's 0 to -20 C. The 1990 chart is a recalibration, richer, on the in-between sizes. The 1991 supplement (p.23, PDF p.513) recalibrates again, back to round sizes, and prints a part number for each jet. The app now carries all three charts and picks by model year. 1992-95 and the Venture get the 1991 chart, labelled as the nearest chart rather than their own.

**Jet part numbers.** The 1991 chart lists #152.5 as 3G2-1423A-81-00, which settles the #152.5 question in favour of the ladder's primary number. It lists #120 to #135 under an older 256-14944-xx-A1 series; those are shown as the 1991 manual numbers, with Partzilla's current numbers kept as the order numbers. No manual lists #121.3.

**Phazer II clutching.** Read for 1990 (p.8-7, PDF p.473) and 1991 (pp.3 and 26, PDF pp.493 and 516). The old Phazer II engagement and shift figures were the 84-89 PZ480 ones; they are replaced:
- 1990 PZ480P/EP: approx 3,200 / 6,850 rpm, primary 90501-501G3, weights 87F-17632-00 48.5 g, secondary 90508-50793 at 75 degrees.
- 1991 PZ480R/ER: approx 3,500 / 6,850 rpm, primary 90501-501G3, weights 87F-W176A-00 48.5 g, secondary 90508-50793 at 70 degrees (C-2), plus two high-altitude columns.
- 1991 PZ480STR: approx 3,200 / 6,850 rpm, primary **90501-45534** (blue-green, 25.0 kg), weights 87M-W176A-00 48.0 g, secondary 90508-50746 at 50 degrees, plus two high-altitude columns.

The 1991 supplement disagrees with itself in two places (page 24 repeats the 1990 weight part number and spring rate); the clutch tables on pages 3 and 26 agree with each other and are used, and the app notes the difference.

**1991 Phazer II ST spring, confirmed.** 90501-45534 is Yamaha's standard primary for the 1991 ST, so Partzilla is right for that sled. It also means the 84-89 conflict spring is a real, softer part (1.06 kg/mm against 1.88), not a typo; the 84-89 warning stands.

**1992-1995.** No 1992 supplement is in the compilation, and the 1993 one covers only the primary sheave (it gives primary spring free length 76.8 mm for PZ480T/ET). Partzilla lists new primary springs from 1992 (527G1 std, 507G2 ST), and the 1996 supplement lists 527G1 for the standard Phazer, so the 1991 clutch figures are not carried forward. These years now show "needs manual" for clutch settings instead of borrowed numbers.

## Mods & upgrades research (2026-11-19)

The **Mods & upgrades** tab is built from `specs.json` → `mods`. Each item carries a tag: `official` (a Yamaha manual or Camoplast chart), `press` (period magazine) or `forum` (riders reporting their own sleds), and links to its sources. Most forum material is from TotallYamaha; snowmobileworld.com, snowest.com, hardcoresledder.com and snowmobilefanatics.com refuse automated reading and were not covered. The full write-up is the Claude Doc "Phazer 485: mods, upgrades and compatibility".

Found in the manuals while checking clutches: the stock primary changed. The 1990 manual (p.4-1) shows pinned weights; the 1993 supplement (p.9) shows riveted weights, roller collars and a spring shim, and the 1991 supplement already lists the newer W176A weight numbers.

Second pass (same day): cold air intake, handlebar risers, running boards, tunnel extensions, long-track skid swaps and track-swap reports, plus a "Where to look" section. All forum-tagged except the manual and fitment references. snowmobileforum.com, dootalk.com and vintagesleds.com (JavaScript wall) could not be read either. Running boards and riser cable part numbers remain undocumented for these chassis.

## Maintenance schedule (2026-11-19)

The **Maintenance** tab uses Yamaha's own Periodic Maintenance Table and Lubrication Intervals from LIT-12618-PZ-50 (1990 PZ480P/EP), pp.2-1 to 2-3 (PDF pp.214-216), transcribed item by item. The Clymer 1984-89 Table 1 and Table 2 (Chapter Three) were compared: same 20/40/80-hour intervals and items, plus the 10-hour head-nut retorque. Items marked "PZ480EP only" (battery, grip warmer) are shown only on electric-start models. The Venture's touring-only items are not covered.

The **Calculators** tab's clutch default (1:1 top ratio) is the top of Clymer's "ratio range 3.5:1 to 1:1" (Quick Reference Data, Transmission specifications, PZ480). Top speed is the no-slip track speed, for comparing setups only.

## Troubleshooting, interchange and identification (2026-11-19)

- **Troubleshooting** is Clymer 1984-89 Chapter Two, symptom by symptom in Clymer's order, including Figure 45 (fuel system chart, read from the page image) and Table 1 (PZ480 electrical resistances). Three cross-links are labelled forum-reported (motor mounts, lug height). The T.O.R.S. entry combines Clymer's Figure 15 wiring with Yamaha's "redo T.O.R.S. after changing idle" note.
- **Interchange** compares the scraped parts index between two models. A shared part number is Yamaha's own interchange; a different one is not proof of non-fit. The belt changed from 89X-17641-01-00 (1986-91) to 89L-17641-01-00 (1992-95); retailer listings for Dayco HPX5000, Ultimax MAX1118M3 and Gates 43G4340 match that split and are tagged as retailer listings.
- **Which sled is this?** uses the starting serial numbers printed in the 1990 manual (p.1-1, PDF p.205), the 1991 supplement (p.1 and General specifications p.22, PDF pp.491 and 512), the 1993 supplement (p.1, PDF p.521) and the 1996 supplement (PDF p.539, outside this app's range). No starting numbers were found for 1986-89, 1992, 1994-95 or the Venture.
- Found on the 1991 General specifications page: the PZ480STR has 1,054 mm of track on the ground (865 mm standard) and 17/33 gearing (17/29 standard). The parts data lists the 121 in track number for the 1991 ST; the identifier treats it as a long track, and the model's track part number still needs checking.

## Still open

- **Venture VT480 manual** — the one real gap. Nothing in the local set covers it, so the Venture's clutching, gearing and suspension remain unverified.
- **Phazer II 1992-1995** clutch settings and jetting chart. A 1992 supplement would close it.
- Lug height on the 136 in ST tracks (sources conflict: 0.725" vs 1.5").
- The `90501-45534-00` vs `90501-52798-00` primary spring conflict for 1986-89 — now 2-to-1 against Partzilla, but not closed.
- The secondary spring colour conflict (yellow-blue vs white) — identify by twist angle instead.
- Chain-link counts in Table 4 for combinations other than the standard 17/29.
- Main jet #121.3: two Partzilla numbers and no manual listing; ask a dealer which is current.
- 1984-85 (PZ480H/J): in the 1984-89 factory manual, but outside the 1986-1995 scope.

## Flywheel, stator and charging (added 2026-11-24)

**Part numbers** come from each model's *Generator* fiche at Rich's Yamaha, read through a browser on 2026-11-24 (the container's proxy blocks the site) and folded into `data/parts.js` as a new `generator` section with `node tools/parts.js merge`. `merge` now replaces only the sections a scrape file covers, so a one-section file like this one leaves the other 16 sections alone. Only the stator, rotor, coils and lead wire were kept; screws and washers were dropped, as with the Partzilla scrape.

| Part | Part number | Models |
|---|---|---|
| Stator assembly | 88F-85510-00-00 | Phazer and Phazer II 1986–1993, Venture GT 1992 |
| Stator assembly | 8BL-85510-00-00 | Phazer II 1994–1995 |
| Stator assembly | 88T-85510-01-00 (was -00) | Venture XL 1991–1993, Venture GT 1993 |
| Stator assembly | 8BK-85510-00-00 | Venture XL 1994–1995 |
| Rotor (flywheel) | 8V0-85550-21-00 (was -20) | Phazer 1986–89, Phazer II 1990 |
| Rotor (flywheel) | 88F-85550-00-00 | Phazer II recoil 1991–95, 1991 ST |
| Rotor (flywheel) | 88H-85550-00-00 | Phazer II LE 1991–95, ST 1992–95, Venture GT |
| Rotor (flywheel) | 88T-85550-00-00 | Venture XL |

The coils inside the Phazer stator do not change: source 86M-85511-00-00, lighting 8H8-85513-20-00 and 82M-85514-20-00, pulser 82M-85580-20-00. Everything except the 88F rotor was listed as discontinued that day.

**Torque**, read off the scanned factory pages in `Yamaha 1984-1999 Phazer.ZIP`:

- 1984–89 PZ480 table, p.8-5 (PDF p.124): "C.D.I. magneto" nut, M16 × 1.0, **73 N·m / 7.3 m·kg / 53 ft·lb**; spark plug 28 N·m. The same page gives m·kg for every engine fastener, now added to the torque table.
- 1990 PZ480P/EP table, p.8-6 (PDF p.472): "Magneto rotor" **85 N·m / 8.5 m·kg / 61 ft·lb**. The two factory tables disagree; the app shows each era its own figure and labels 1991–95 as carried over from 1990. No Venture figure is shown.
- 1991 supplement p.16 (PDF p.506): stator plate screws **7 N·m / 0.7 m·kg / 5.1 ft·lb**, with the install notes (degrease the crank taper, align the stator timing mark with the crankcase seam).

**Resistance table.** The old table had the 1984–89 source coil as "1.16–1.42 ohm". Yamaha's own page (p.8-10, PDF p.129) prints **1.29 kΩ ± 10%**, so the range is 1.16–1.42 **kΩ**; corrected. The table now has a 1990 column from LIT-12618-PZ-50 pp.8-13/8-14 (PDF pp.479–480), which disagrees with 1984–89 on the pickup coil (14 vs 17 Ω), source coil (556 vs 1,290) and grip warmer coil (3 vs 0.66 Ω), and prints the pickup and source figures with no unit. Both columns are shown with a warning rather than one being picked. The magneto is a Mitsubishi F3T368 in both manuals.
