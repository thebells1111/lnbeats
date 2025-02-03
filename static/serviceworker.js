// Empty Service Worker with Cache Clearing

self.addEventListener('install', (e) => {
	// Do nothing on install
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					return caches.delete(cacheName);
				})
			);
		})
	);
});

self.addEventListener('fetch', (e) => {
	e.respondWith(fetch(e.request));
});
