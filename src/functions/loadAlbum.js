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

async function loadAlbum(albumId) {
	console.log(albumId);
	try {
		let albumUrl =
			remoteServer + `api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${albumId}`)}`;
		let albumRes = await fetch(albumUrl);
		let albumData = await albumRes.json();

		const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
		let data = await res.text();

		let xml2Json = parse(data, parserOptions);
		let feed = xml2Json.rss.channel;

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
				albumData.feed.remoteSongs = [].concat(feed?.['podcast:remoteItem'] || []);
				albumData.feed.songs = [];
				albumData.feed.live = [];
			} else {
				albumData.feed.remoteSongs = [];
				albumData.feed.songs = feed.item ? [].concat(feed.item) : [];
				albumData.feed.live = [].concat(data.liveItem);
			}

			return albumData.feed;
		}
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

export default loadAlbum;
