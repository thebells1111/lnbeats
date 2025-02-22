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
	const filteredAlbums = albums.map((v) => {
		return requiredChannelTags.reduce((acc, tag) => {
			acc[tag] = v.hasOwnProperty(tag) ? v[tag] : null;
			if (tag === 'item') {
				acc.item = acc.item || [];
				acc.item = acc.item.map((v) => {
					let i = {};
					i.title = v?.title;
					i.description = v?.description;
					i.guid = v?.guid?.['#text'] || v?.guid;
					i.datePublished = v?.pubDate;
					i.duration = v?.['itunes:duration'];
					i.explicit = v?.['itunes:explicit'];
					i.image = v?.['itunes:image']?.['@_href'] || v?.image['@_url'];
					i['podcast:season'] = v?.['podcast:season'];
					i['podcast:episode'] = v?.['podcast:episode'];

					return i;
				});
			}

			if (tag === 'image') {
				acc.image = v.image = v.artwork || v.image || '';
			}
			return acc;
		}, {});
	});

	return filteredAlbums;
}
