/* PhazerMania offline cache. build.sh replaces __VERSION__ with a hash of the
   page, so every deploy gets a fresh cache and old ones are deleted.
   Pages: network first, but if the network has not answered within
   NET_TIMEOUT ms (one bar of signal in the shop or on the trail) the cached
   copy is shown at once; the network answer still refreshes the cache.
   Fonts: cache first (they never change). */
var CACHE = "phazermania-__VERSION__";
var NET_TIMEOUT = 3000;
var PAGE = "./index.html";
var CORE = [PAGE, "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    // Revalidate with the server so a deploy never installs the previous page
    // from the browser's HTTP cache (GitHub Pages sends max-age=600).
    return c.addAll(CORE.map(function (u) { return new Request(u, { cache: "no-cache" }); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("phazermania-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(CACHE).then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) { c.put(req, res.clone()); return res; });
      });
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  // Every navigation inside the scope is the one-page app: keep a single copy
  // under PAGE instead of one per #hash or ?query.
  var nav = req.mode === "navigate";
  var key = nav ? PAGE : req;
  var net = fetch(nav ? new Request(req.url, { cache: "no-cache", credentials: "same-origin" }) : req).then(function (res) {
    if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { return c.put(key, copy); }); }
    return res;
  });
  e.waitUntil(net.catch(function () {}));
  e.respondWith(new Promise(function (resolve, reject) {
    var done = false;
    var fromCache = function () {
      return caches.match(key, { ignoreSearch: true }).then(function (hit) {
        if (hit && !done) { done = true; resolve(hit); }
        return !!hit;
      });
    };
    var timer = setTimeout(fromCache, NET_TIMEOUT);
    net.then(function (res) {
      clearTimeout(timer);
      if (!done) { done = true; resolve(res); }
    }, function (err) {
      clearTimeout(timer);
      fromCache().then(function (ok) { if (!ok && !done) { done = true; reject(err); } });
    });
  }));
});
