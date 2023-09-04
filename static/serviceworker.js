var cacheName = 'lnbeats-cache-v1';
var contentCache = 'content-v1';
var mediaCache = 'media-v1';

self.addEventListener('install', function (e) {
	e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(['/index.html'])));
	self.skipWaiting();
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if ([cacheName, contentCache, mediaCache].indexOf(key) === -1) {
						return caches.delete(key);
					}
				})
			);
		})
	);
	clients.claim();
});

self.addEventListener('fetch', (e) => {
	if (e.request.url.match(/\.(jpg|jpeg|png|gif|mp3|webp|svg|bmp)$/)) {
		e.respondWith(
			caches.open(mediaCache).then((cache) => {
				return cache.match(e.request).then((response) => {
					return (
						response ||
						fetch(e.request).then((networkResponse) => {
							cache.put(e.request, networkResponse.clone());
							return networkResponse;
						})
					);
				});
			})
		);
	} else {
		e.respondWith(
			caches.match(e.request).then((response) => {
				return response || fetch(e.request).catch(() => caches.match('/offline.html'));
			})
		);
	}
});
