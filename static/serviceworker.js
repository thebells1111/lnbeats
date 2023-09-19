// Cache Names
let cacheSuffix = '9.17.23';
// cacheSuffix = new Date().getTime();
var cacheName = 'lnbeats-cache-' + cacheSuffix;
var contentCache = 'content-' + cacheSuffix;
var mediaCache = 'media-' + cacheSuffix;
var dynamicCache = 'dynamic-' + cacheSuffix;

// Time-to-live for dynamic cache in milliseconds (1 hour)
const TTL = 3600000;

// Install Event
self.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(cacheName).then((cache) => cache.addAll(['/index.html', '/offline.html']))
	);
	self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if ([cacheName, contentCache, mediaCache, dynamicCache].indexOf(key) === -1) {
						return caches.delete(key);
					}
				})
			);
		})
	);
	clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (e) => {
	const isSameOrigin = e.request.url.startsWith(self.location.origin);

	// Handle Media Files
	if (e.request.url.match(/\.(jpg|jpeg|png|gif|mp3|webp|svg|bmp)$/)) {
		e.respondWith(
			caches.open(mediaCache).then((cache) => {
				return cache.match(e.request).then((response) => {
					return (
						response ||
						fetch(e.request)
							.then((networkResponse) => {
								cache.put(e.request, networkResponse.clone());
								return networkResponse;
							})
							.catch(() => {})
					);
				});
			})
		);
	}
	// Handle Local Files with TTL
	else if (isSameOrigin) {
		e.respondWith(
			caches.open(dynamicCache).then((cache) => {
				return cache.match(e.request).then((response) => {
					if (response) {
						const currentTime = Date.now();
						const cachedTime = parseInt(response.headers.get('sw-cache-timestamp') || '0', 10);

						if (currentTime - cachedTime < TTL) {
							return response;
						}
					}

					return fetch(e.request)
						.then((networkResponse) => {
							const clonedResponse = networkResponse.clone();
							const responseHeaders = new Headers(clonedResponse.headers);
							responseHeaders.append('sw-cache-timestamp', Date.now().toString());

							cache.put(
								e.request,
								new Response(clonedResponse.body, {
									status: clonedResponse.status,
									statusText: clonedResponse.statusText,
									headers: responseHeaders
								})
							);

							return networkResponse;
						})
						.catch(() => caches.match('/offline.html'));
				});
			})
		);
	}
});
