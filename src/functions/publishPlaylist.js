import localforage from 'localforage';
import parser from 'fast-xml-parser';
import blankplaylist from './blankplaylist.json';
import clone from 'just-clone';

import generateValidGuid from './generateValidGuid';
import { user, remoteServer } from '$/stores';
import { get } from 'svelte/store';

const escapeAttr = (str) =>
	str.replace(
		/[&<>'"]/g,
		(tag) =>
			({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				"'": '&#39;',
				'"': '&quot;'
			}[tag])
	);

const escapeTag = (str) => {
	if (str.match(/[&<>'"]/g)) {
		return '<![CDATA[' + str + ']]>';
	}
	return str;
};

let js2xml = new parser.j2xParser({
	attributeNamePrefix: '@_',
	//attrNodeName: false,
	textNodeName: '#text',
	ignoreAttributes: false,
	ignoreNameSpace: false,
	format: true,
	indentBy: '  ',
	supressEmptyNode: true,
	attrValueProcessor: (val, attrName) => escapeAttr(`${val}`),
	tagValueProcessor: (val, tagName) => escapeTag(`${val}`)
});

let rss = {
	'@_version': '2.0',
	'@_endcoding': 'UTF-8',
	'@_xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
	'@_xmlns:podcast': 'https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md',
	'@_xmlns:media': 'http://search.yahoo.com/mrss/'
};

export default async function publishPlaylist(list) {
	const playlistDB = localforage.createInstance({
		name: 'playlistDB'
	});
	let guids = (await playlistDB.getItem('guids')) || [];
	let $user = get(user);

	let playlist = clone(blankplaylist);
	let title = list.playlist;
	let guid = Object.entries(guids).find(([key, value]) => value === title)?.[0];
	if (!guid) {
		guid = await generateValidGuid();
		guids[guid] = title;
		await playlistDB.setItem('guids', guids);
	}
	playlist['podcast:guid'] = guid;

	playlist.link = 'https://lnbeats.com/album/' + guid;
	playlist['podcast:remoteItem'] = list.songs.map((v) => {
		return { '@_feedGuid': v.album.podcastGuid, '@_itemGuid': v?.guid?.['#text'] || v.guid };
	});
	playlist['itunes:owner'] = {
		'itunes:email': $user.name,
		'itunes:name': `Steven B.`
	};
	playlist.title = title;
	playlist.description = 'A test feed to see if I can host LN Beats playlists.';

	console.log(playlist);
	console.log(guids);

	rss.channel = playlist;

	let xmlJson = { rss: rss };
	let xmlFile = js2xml.parse(xmlJson);
	console.log(xmlFile);

	return { success: true, message: 'Play list published' };
}

async function checkPodcastIndex(guid) {
	const guidUrl =
		remoteServer +
		`api/queryindex?q=podcasts/byguid?guid=${encodeURIComponent($editingFeed['podcast:guid'])}`;
	const guidRes = await fetch(guidUrl);
	const guidData = await guidRes.json();
	console.log(guidData);

	if (guidData.status === 'true' && guidData.feed.length) {
	}

	if (data?.status === 'true') {
		console.log('podping');
		podping();
	} else if (data?.status === 'false' && !guidData?.feed?.length) {
		console.log('addFeed');
		addFeed();
	}
}

async function podping() {
	let url =
		remoteServer + `api/podping?url=${encodeURIComponent(feedUrl)}&reason=update&medium=music`;

	console.log(url);

	const res = await fetch(url);
	const data = await res.text();
	if (data === 'Success!') {
		displayText =
			'Feed successfully updated. Please wait a few minutes for your changes to appear in the player.';
	} else {
		displayText = data;
	}
}

async function addFeed() {
	let feed = remoteServer + `api/queryindex?q=add/byfeedurl?url=${encodeURIComponent(feedUrl)}`;

	const res = await fetch(feed);
	const data = await res.json();
	displayText = data.description;
	console.log(data);
}
