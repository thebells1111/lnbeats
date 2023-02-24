import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { parse } from 'fast-xml-parser';
import { decode } from 'html-entities';

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
		let albumUrl = `/api/queryindex?q=${encodeURIComponent(
			`/podcasts/byfeedid?id=${params.slug}`
		)}`;

		const albumRes = await fetch(albumUrl);
		let albumData = await albumRes.json();
		albumData = JSON.parse(albumData);
		if (!albumData.status) {
			throw error(404, 'Not found');
		}

		console.log(albumData);

		let url = `/api/queryindex?q=${encodeURIComponent(`/episodes/byfeedid?id=${params.slug}`)}`;

		console.log();
		const res = await fetch(`/api/proxy?q=${albumData.feed.url}`);
		let data = await res.text();

		let xml2Json = parse(data, parserOptions);
		let feed = xml2Json.rss.channel;

		if (feed) {
			albumData.feed.songs = [].concat(feed.item);
			albumData.feed.live = [].concat(data.liveItem);
			return { album: albumData.feed };
		}
	} catch (err) {
		console.log(err);
	}
}
