import { parse } from 'fast-xml-parser';
import { decode } from 'html-entities';

import { remoteServer } from '$/stores';

const parserOptions = {
	attributeNamePrefix: '@_',
	//attrNodeName: false,
	//textNodeName : "#text",
	ignoreAttributes: false,
	ignoreNameSpace: false,
	attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
	tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
};

async function loadAlbum(albumId, album) {
	let feed;
	let albumData;
	let feedPromise;
	if (!(album?.item?.length || album?.songs?.length)) {
		album.medium = 'musicL';
	}

	if (
		(album?.songs && album?.medium !== 'musicL') ||
		(album?.remoteSongs && album?.medium === 'musicL')
	) {
		feedPromise = fetch(remoteServer + `api/proxy?url=${album.url}`)
			.then((res) => res.text())
			.then((data) => {
				let xml2Json = parse(data, parserOptions);
				feed = xml2Json.rss.channel;
				return feed;
			});

		album.promise = feedPromise;

		return album;
	}

	try {
		console.log(album);
		if (!(album?.item?.length || album?.remoteItem?.length)) {
			let albumUrl =
				remoteServer + `api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${albumId}`)}`;
			let albumRes = await fetch(albumUrl);
			albumData = await albumRes.json();

			const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
			let data = await res.text();

			let xml2Json = parse(data, parserOptions);
			feed = xml2Json.rss.channel;
		} else {
			feed = album;
			albumData = { feed };

			feedPromise = fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`)
				.then((res) => res.text())
				.then((data) => {
					let xml2Json = parse(data, parserOptions);
					feed = xml2Json.rss.channel;
					return feed;
				});
		}

		if (feed) {
			if (feed?.['podcast:medium'] === 'music') {
				if (feed.item?.[0]?.['podcast:episode']) {
					feed.item.sort((a, b) => (a['podcast:episode'] > b['podcast:episode'] ? 1 : -1));
				} else if (feed.item?.[0]?.['itunes:episode']) {
					feed.item.sort((a, b) => (a['itunes:episode'] > b['itunes:episode'] ? 1 : -1));
				}
			}

			if (feed?.['podcast:medium'] === 'musicL') {
				// music playlist feeds (musicL) can only contain remoteItems
				albumData.feed.remoteSongs = []
					.concat(feed?.['podcast:remoteItem'] || feed?.remoteItem || [])
					.map((v) => {
						if (!v.enclosure) {
							v.enclosure = { '@_type': v.enclosureType, '@_url': v.enclosureUrl };
						}

						return v;
					});
				albumData.feed.songs = [];
			} else {
				albumData.feed.remoteSongs = [];
				albumData.feed.songs = feed.item
					? [].concat(feed.item).map((v) => {
							if (!v.enclosure) {
								v.enclosure = { '@_type': v.enclosureType, '@_url': v.enclosureUrl };
							}

							return v;
					  })
					: [];
			}

			//this is to fetch the feed, do all the otherstuff, and load the album,
			// and when the feed is fetched use it to build the valueBlock since that's not
			// stored in the database
			if (feedPromise) {
				albumData.feed.promise = feedPromise;
			}

			return albumData.feed;
		}
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

export default loadAlbum;
