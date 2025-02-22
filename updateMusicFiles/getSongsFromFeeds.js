import cleanAlbums from './cleanAlbums.js';
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

export default async function getSongsFromFeeds(albums, remoteServer) {
	try {
		let length = albums.length;
		let albumsWithSongs = [];
		for (let index = 0; index < length; index++) {
			console.log(`${index} of ${length}`);
			if (!albums?.item?.length) {
				let album = await getSongs(albums[index], remoteServer);
				albumsWithSongs.push(album);
			}
		}

		let cleanedAlbums = cleanAlbums(albumsWithSongs.filter((v) => v));

		return cleanedAlbums;
	} catch (error) {
		return [];
	}
}

async function getSongs(album, remoteServer) {
	try {
		let url = remoteServer ? remoteServer + `api/proxy?url=${album.url}` : album.url;
		const res = await fetch(url);
		const data = await res.text();
		const xml2Json = parse(data, parserOptions);
		const feed = xml2Json.rss.channel;
		album.item = feed?.item ? [].concat(feed.item) : [];
	} catch (error) {
		console.log(album.url);
		console.log(error);

		album.item = [];
	}

	return album;
}
