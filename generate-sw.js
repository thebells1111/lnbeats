import fs from 'fs';

const cacheVersion = `site-cache-${Date.now()}`; // Generates a new cache name
const swTemplate = `
const CACHE_NAME = '${cacheVersion}';
const ASSET_TYPES = ['image', 'audio', 'script', 'style', 'document'];
const PRECACHE_URLS = [
	'/', 
	'/index.html', 
	'/styles.css', 
	'/script.js'
];

self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
	);
	self.skipWaiting();
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', (e) => {
	const { request } = e;
	const fileType = request.destination;

	if (ASSET_TYPES.includes(fileType)) {
		e.respondWith(
			caches.open(CACHE_NAME).then(async (cache) => {
				const cachedResponse = await cache.match(request);
				const networkResponse = fetch(request).then((response) => {
					if (response && response.status === 200) {
						cache.put(request, response.clone());
					}
					return response;
				});

				return cachedResponse || networkResponse;
			})
		);
	} else {
		e.respondWith(fetch(request));
	}
});
`;

fs.writeFileSync('./static/serviceworker.js', swTemplate);
console.log(`Generated service-worker.js with CACHE_NAME: ${cacheVersion}`);
