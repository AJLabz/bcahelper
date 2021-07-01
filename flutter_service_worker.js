'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"index.html": "1e04f05810819557fea925aa9b450a70",
"/": "1e04f05810819557fea925aa9b450a70",
"main.dart.js": "cb9b7a20ee621bb278f1bb2d08a407e3",
"favicon.png": "8aa9c171bf438e4a03258f9640e893a1",
"manifest.json": "bd66bccd4edba7c537ed8a28eb938fb0",
"version.json": "fd0b20f01fa009d41b1a8cc42cf9043f",
"assets/FontManifest.json": "93cfe86b1cf05850d478a6588fd99b9c",
"assets/NOTICES": "cf6df594bb882ff4582022a0bee14073",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/packages/fluttertoast/assets/toastify.js": "e7006a0a033d834ef9414d48db3be6fc",
"assets/assets/imgs/java.png": "fb5b906e70dc702caf7a7bdda9ca527c",
"assets/assets/imgs/ite.png": "5d41c28da629349af9efd32aaf58f030",
"assets/assets/imgs/dbms.webp": "5bb3bfa8fb85a8d5c1e01a5a6821949b",
"assets/assets/imgs/web.png": "5a93327d64eaed8d24260307b319ebaa",
"assets/assets/imgs/coa.jpg": "ffb38346c030c8096f3da4c5b55d309a",
"assets/assets/imgs/linux.jpeg": "6bcf0eb100e995f4f5004edebddeea35",
"assets/assets/imgs/dm.png": "841a66c3f19438927f2ff243b6934e2a",
"assets/assets/imgs/err.png": "93a78077131b7e3319ac47df1dd10c06",
"assets/assets/imgs/android.png": "8d9fbd11b4cbf8c4e18326ac99850c69",
"assets/assets/imgs/algorithm.jpg": "6237e0512b9f31f38196c0457ff39a99",
"assets/assets/imgs/logo.png": "e3d79ec3bc5c0fd9a6adce695ce15808",
"assets/assets/imgs/c.png": "b931a49cb120bbb5624f5fed353837f3",
"assets/assets/imgs/os.png": "c33628f24fc663985d8b3fb6b239eb87",
"assets/assets/imgs/sase.jpg": "529090dad3a88db17c6ed084859cf3aa",
"assets/assets/imgs/cn.webp": "6cff43e453839724db002dc4d9b3c375",
"assets/assets/imgs/cpp.webp": "203bdeb64a9c2959bf888a334bdf663f",
"assets/assets/imgs/cloud.png": "a39d1295a5e9e7d26ecf0ee3d76859c3",
"assets/assets/imgs/cfd.jpg": "1f1fa724b5fde413d269096d0c4b92c9",
"assets/assets/imgs/cpu.jpeg": "3bc5c372c0e07988c14708e7f121ab88",
"assets/assets/imgs/cg.jpg": "d873342955341d044f1c49381ecf17c6",
"assets/assets/fonts/Copse-Regular.ttf": "99f89ca1a6f3311b0abe70fd01c2260c",
"assets/AssetManifest.json": "fde40b7edc709b16b27d9cb261a65cd3"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
