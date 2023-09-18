<script>
	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';
	import { discoverList, remoteServer } from '$/stores';

	const parserOptions = {
		attributeNamePrefix: '@_',
		//attrNodeName: false,
		//textNodeName : "#text",
		ignoreAttributes: false,
		ignoreNameSpace: false,
		attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
		tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
	};

	$: if ($discoverList.length) {
		console.log($discoverList);
		handleDiscover();
	}

	let songs = [];
	let albums = {};
	let bad = [];

	async function handleDiscover() {
		for (let i = 0; i < $discoverList.length; i++) {
			await getSongs($discoverList[i]);
		}
	}

	async function getSongs(album) {
		const res = await fetch(remoteServer + `api/proxy?url=${album.url}`);
		let data = await res.text();

		let xml2Json = parse(data, parserOptions);

		let feed = xml2Json.rss?.channel;

		if (feed) {
			if (feed.item?.[0]?.['podcast:episode']) {
				feed.item.sort((a, b) => (a['podcast:episode'] > b['podcast:episode'] ? 1 : -1));
			}

			album.songs = [].concat(feed.item);
			album.live = data.liveItem ? [].concat(data.liveItem) : undefined;
			albums.push(album);
			songs = songs.concat(album.songs);
		} else {
			bad.push(album);
			console.log();
			console.log('__________________________________');
			console.log(album);
			console.log('__________________________________');
			console.log();
		}

		console.log('songs: ', songs);
		console.log('albums: ', albums);
		console.log('bad: ', bad);
	}
</script>
