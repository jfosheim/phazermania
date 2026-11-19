/*
 * Partzilla OEM parts scraper - Yamaha Phazer / Phazer II / Venture
 *
 * The MODELS list below is generated from data/specs.json by
 *   node tools/parts.js models
 * and the build fails if the two drift. Save the output of copy(emit()) to a
 * file and fold it in with  node tools/parts.js merge <file>.
 *
 * HOW TO USE
 *   1. Open https://www.partzilla.com/catalog/yamaha/snowmobile/1992 in a browser.
 *   2. Open DevTools console (F12) and paste this whole file.
 *   3. Run:  await run()            // scrapes every model below
 *      Then: copy(emit())           // puts the JSON on your clipboard
 *
 * WHY A BROWSER: partzilla.com returns 403 to plain HTTP clients (curl, fetch
 * from Node, WebFetch). Running inside an already-loaded partzilla page means
 * the requests are same-origin and carry the session, so they succeed.
 *
 * WHAT THE "STD" FLAG MEANS: Partzilla marks the factory-standard item in a
 * group with "UR STD" (and alternates with "AP"). That flag is how the spec
 * sheet knows which main jet / spring / sprocket was stock.
 */

const MODELS = [
  ['1986', 'phazer-pz480k'],
  ['1987', 'phazer-pz480l'],
  ['1987', 'phazer-deluxe-elec-start-pz480el'],
  ['1988', 'phazer-pz480m'],
  ['1988', 'phazer-deluxe-elec-start-pz480em'],
  ['1989', 'phazer-pz480n'],
  ['1990', 'phazer-ii-pz480p'],
  ['1990', 'phazer-ii-le-elec-start-pz480ep'],
  ['1991', 'phazer-ii-pz480r'],
  ['1991', 'phazer-ii-le-elec-start-pz480er'],
  ['1991', 'phazer-ii-st-pz480str'],
  ['1991', 'venture-xl-vt480r'],
  ['1992', 'phazer-ii-pz480s'],
  ['1992', 'phazer-ii-le-elec-start-pz480es'],
  ['1992', 'phazer-ii-st-pz480sts'],
  ['1992', 'venture-gt-vt480gts'],
  ['1992', 'vt480s'],
  ['1993', 'phazer-ii-pz480t'],
  ['1993', 'phazer-ii-le-elec-start-pz480et'],
  ['1993', 'phazer-ii-st-pz480stt'],
  ['1993', 'venture-gt-vt480gtt'],
  ['1993', 'venture-xl-vt480t'],
  ['1994', 'phazer-ii-pz480u'],
  ['1994', 'phazer-ii-le-elec-start-pz480eu'],
  ['1994', 'phazer-ii-st-long-track-pz480stu'],
  ['1994', 'venture-xl-vt480u'],
  ['1995', 'phazer-ii-pz480v'],
  ['1995', 'phazer-ii-le-elec-start-pz480ev'],
  ['1995', 'phazer-ii-st-long-track-pz480stv'],
  ['1995', 'venture-xl-vt480v'],
];

// Diagram section -> regex of descriptions worth keeping. Everything else
// (washers, circlips, generic bolts) is dropped.
const SECTIONS = {
  'carburetor':         /JET|NOZZLE|NEEDLE|CARBURETOR ASS|PLUNGER|FLOAT|VALVE|SCREW, PILOT/i,
  'crankshaft-piston':  /PISTON|RING|CRANK|BEARING/i,
  'cylinder':           /CYLINDER|GASKET|HEAD/i,
  'track-drive-1':      /SPROCKET|CHAIN|GEAR/i,
  'track-suspension-1': /TRACK|SLIDE|SPRING|SHOCK|GUIDE/i,
  'track-suspension-2': /TRACK|SLIDE|SPRING|SHOCK|GUIDE/i,
  'primary-sheave':     /WEIGHT|SPRING|SHEAVE|ROLLER|BELT/i,
  'secondary-sheave':   /WEIGHT|SPRING|SHEAVE|BELT/i,
  'electrical-1':       /PLUG|C\.?D\.?I|COIL|IGNITER|MAGNETO|STATOR|RECTIFIER|SPARK/i,
  'electrical-2':       /PLUG|C\.?D\.?I|COIL|IGNITER|MAGNETO|STATOR|RECTIFIER|SPARK/i,
  'electrical-3':       /PLUG|C\.?D\.?I|COIL|IGNITER|MAGNETO|STATOR|RECTIFIER|SPARK/i,
  'brake':              /PAD|DISC|CALIPER|ROTOR/i,
  'ski':                /SKI|RUNNER|WEAR/i,
  'exhaust':            /PIPE|SILENCER|MUFFLER/i,
  'air-cleaner':        /ELEMENT|FILTER|CASE/i,
  'oil-pump':           /PUMP|GEAR/i,
};

const DATA = {};

async function scrapeModel(year, slug) {
  const base = `/catalog/yamaha/snowmobile/${year}/${slug}`;
  const jobs = Object.keys(SECTIONS).map(async (section) => {
    let doc;
    try {
      const res = await fetch(`${base}/${section}`);
      if (!res.ok) return [];
      doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    } catch (e) {
      return [];
    }
    const keep = SECTIONS[section];
    const rows = [];
    for (const tr of doc.querySelectorAll('table tr')) {
      // These two testids are the only reliable way to split description from
      // part number - the cell's text content runs them together.
      const nameEl = tr.querySelector('[data-testid=diagramTableProductName]');
      const pnEl = tr.querySelector('[data-testid=diagramTableProductPartName]');
      if (!nameEl || !pnEl) continue;
      const desc = nameEl.textContent.replace(/\s+/g, ' ').trim();
      if (!keep.test(desc)) continue;
      const tds = tr.querySelectorAll('td');
      const ref = tds.length > 1 ? tds[1].textContent.replace(/\s+/g, '').trim() : '';
      rows.push({ section, ref, desc, pn: pnEl.textContent.trim() });
    }
    return rows;
  });
  return (await Promise.all(jobs)).flat();
}

// Batched, because 30 models x 16 sections at once gets throttled.
async function run(batchSize = 6) {
  for (let i = 0; i < MODELS.length; i += batchSize) {
    const batch = MODELS.slice(i, i + batchSize).filter(([y, s]) => !DATA[`${y}/${s}`]);
    await Promise.all(batch.map(async ([y, s]) => {
      DATA[`${y}/${s}`] = await scrapeModel(y, s);
    }));
    console.log(`scraped ${Object.keys(DATA).length}/${MODELS.length}`);
  }
  return Object.keys(DATA).length;
}

// Only the rows a spec sheet actually needs.
const CURATED = /TRACK AS|METAL, SLIDE|SPROCKET, CHAIN|CHAIN \(|V-BELT|WEIGHT|SPRING, COMPRESSION|SEAT, SEC|JET, MAIN|JET, PILOT|NOZZLE|CARBURETOR ASSEMBLY|NEEDLE VALVE|PISTON|GASKET, CYLINDER|C\.D\.I|IGNITION COIL|PLUG CAP|DISC, BRAKE|PAD, CALIPER|RUNNER|^SKI|EXHAUST PIPE|MUFFLER ASSEMBLY|OIL PUMP|SHOCK ABSORBER|SPRING, REAR|SPRING, FRONT|GUIDE WHEEL/i;

function emit({ curated = true } = {}) {
  const out = {};
  for (const key of Object.keys(DATA).sort()) {
    out[key] = curated ? DATA[key].filter((r) => CURATED.test(r.desc)) : DATA[key];
  }
  return JSON.stringify(out, null, 2);
}

// Just the factory-standard picks, one line per model - handy for eyeballing
// year-to-year changes.
function stdOnly() {
  return Object.keys(DATA).sort().map((key) => {
    const std = DATA[key].filter((r) => /\bSTD\b/.test(r.desc));
    return key + '\n' + std.map((r) => `  ${r.desc} = ${r.pn}`).join('\n');
  }).join('\n');
}

console.log('Loaded. Run:  await run()   then   copy(emit())');
