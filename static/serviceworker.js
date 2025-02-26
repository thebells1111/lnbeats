const CACHE_NAME = 'site-cache-v1';
const ASSET_TYPES = ['image', 'audio', 'script', 'style', 'document']; // Types to cache
const PRECACHE_URLS = [
	'/', // Cache homepage
	'/index.html', // Main HTML file
	'/styles.css', // Main CSS file
	'/script.js' // Main JS file
];

// Precache on install
self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(PRECACHE_URLS);
		})
	);
	self.skipWaiting();
});

// Cleanup old caches on activation
self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

// Cache assets dynamically
self.addEventListener('fetch', (e) => {
	const { request } = e;
	const fileType = request.destination;

	// Only cache specified asset types
	if (ASSET_TYPES.includes(fileType)) {
		e.respondWith(
			caches.open(CACHE_NAME).then(async (cache) => {
				const cachedResponse = await cache.match(request);
				if (cachedResponse) return cachedResponse;

				return fetch(request).then((response) => {
					// Cache only successful responses
					if (!response || response.status !== 200) return response;

					cache.put(request, response.clone());
					return response;
				});
			})
		);
	} else {
		// Fetch normally for other requests
		e.respondWith(fetch(request));
	}
});
