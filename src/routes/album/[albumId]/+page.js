import { error, redirect } from '@sveltejs/kit';
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
		let redirect;
		let albumUrl =
			remoteServer +
			`api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${params.albumId}`)}`;
		let albumRes = await fetch(albumUrl);
		let albumData = await albumRes.json();

		console.log(albumData.feed);

		if (!albumData?.feed?.podcastGuid) {
			albumUrl =
				remoteServer +
				`api/queryindex?q=${encodeURIComponent(`podcasts/byfeedid?id=${params.albumId}`)}`;
			albumRes = await fetch(albumUrl);
			albumData = await albumRes.json();

			if (!albumData?.feed?.id) {
				return { redirect: '/' };
			} else {
				redirect = '/album/' + albumData?.feed?.podcastGuid;
			}
		}

		const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
		let data = await res.text();

		let xml2Json = parse(data, parserOptions);
		let feed = xml2Json.rss.channel;

		if (feed) {
			if (feed.medium === 'music') {
				if (feed.item?.[0]?.['podcast:episode']) {
					feed.item.sort((a, b) => (a['podcast:episode'] > b['podcast:episode'] ? 1 : -1));
				} else if (feed.item?.[0]?.['itunes:episode']) {
					feed.item.sort((a, b) => (a['itunes:episode'] > b['itunes:episode'] ? 1 : -1));
				}
			}
			albumData.feed.songs = feed.item ? [].concat(feed.item) : [];
			albumData.feed.live = [].concat(data.liveItem);
			return { album: albumData.feed, redirect };
		}
	} catch (err) {
		console.log(err);
		return { album: undefined };
	}
}
