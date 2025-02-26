const requiredChannelTags = [
	'id',
	'title',
	'url',
	'image',
	'description',
	'author',
	'lastUpdateTime',
	'newestItemPubdate',
	'generator',
	'podcastGuid',
	'explicit',
	'medium',
	'item'
];

export default function cleanAlbums(albums) {
	return albums.map((v) => {
		return requiredChannelTags.reduce((acc, tag) => {
			// Use "in" to check if property exists, and default to null if not.
			acc[tag] = tag in v ? v[tag] : null;

			if (tag === 'item') {
				acc.item = Array.isArray(acc.item) ? acc.item : [];
				acc.item = acc.item.map((w) => {
					const mappedItem = {
						title: w?.title,
						description: w?.description,
						guid: w?.guid?.['#text'] || w?.guid,
						datePublished: w?.pubDate,
						duration: w?.['itunes:duration'],
						enclosure: w?.enclosure,
						explicit: w?.['itunes:explicit'],
						image: w?.['itunes:image']?.['@_href'] || w?.image?.['@_url'] || null,
						'podcast:season': w?.['podcast:season'],
						'podcast:episode': w?.['podcast:episode']
					};
					return Object.fromEntries(
						Object.entries(mappedItem).filter(([key, value]) => value != null)
					);
				});
			}

			if (tag === 'image') {
				acc.image = v.artwork || v.image || '';
			}

			return acc;
		}, {});
	});
}
