import cleanAlbums from './cleanAlbums.js';
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

export default async function getSongsFromFeeds(albums) {
	try {
		let length = albums.length;
		let albumsWithSongs = [];
		for (let index = 0; index < length; index++) {
			console.log(`${index} of ${length}`);
			if (!albums?.item?.length) {
				let album = await getSongs(albums[index]);
				albumsWithSongs.push(album);
				await delay(0);
			}
		}

		let cleanedAlbums = cleanAlbums(albumsWithSongs.filter((v) => v));

		return cleanedAlbums;
	} catch (error) {
		return [];
	}
}

async function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getSongs(album) {
	try {
		let url = remoteServer + `api/proxy?url=${album.url}`;
		const res = await fetch(url);

		if (res.status === 404) {
			console.log('404 feed: ' + url);
			return false;
		}
		const data = await res.text();
		const xml2Json = parse(data, parserOptions);
		const feed = xml2Json.rss.channel;
		album.item = feed?.item ? [].concat(feed.item) : [];
	} catch (error) {
		console.log(album.url);
		console.log(error);

		return false;
	}

	return album;
}
