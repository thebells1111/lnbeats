import { error } from '@sveltejs/kit';
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

export async function load({ params, fetch }) {
	try {
		let albumUrl =
			remoteServer +
			`api/queryindex?q=${encodeURIComponent(`/podcasts/byguid?guid=${params.albumId}`)}`;

		const albumRes = await fetch(albumUrl);
		let albumData = await albumRes.json();
		if (!albumData.status) {
			error(404, 'Not found');
		}

		const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
		let data = await res.text();

		let xml2Json = parse(data, parserOptions);
		let feed = xml2Json.rss.channel;

		if (feed) {
			if (feed.item?.[0]?.['podcast:episode']) {
				feed.item.sort((a, b) => (a['podcast:episode'] > b['podcast:episode'] ? 1 : -1));
			} else if (feed.item?.[0]?.['itunes:episode']) {
				feed.item.sort((a, b) => (a['itunes:episode'] > b['itunes:episode'] ? 1 : -1));
			}

			albumData.feed.songs = [].concat(feed.item);
			albumData.feed.live = data.liveItem ? [].concat(data.liveItem) : undefined;

			return { album: albumData.feed, songId: params.songId };
		}
	} catch (err) {
		console.log(err);
	}
}
