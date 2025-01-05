import localforage from 'localforage';
import parser from 'fast-xml-parser';
import blankplaylist from './blankplaylist.json';
import clone from 'just-clone';

import generateValidGuid from './generateValidGuid';
import { user, remoteServer, publishingDisplay } from '$/stores';
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
let response = {
	status: 'true',
	feedId: 7157117,
	existed: 'false',
	description:
		'Feed added successfully. Please allow 15-20 minutes for it to be searchable in the index.'
};
export default async function publishPlaylist(list) {
	console.log(list);
	publishingDisplay.set('Publishing Playlist');

	let $user = get(user);

	let playlist = clone(blankplaylist);
	playlist['podcast:guid'] = list.guid;

	playlist.link = 'https://lnbeats.com/album/' + list.guid;
	playlist['podcast:remoteItem'] = list.remoteSongs;
	playlist['itunes:owner'] = {
		'itunes:email': $user.name,
		'itunes:name': $user.name
	};
	playlist.title = list.title;
	delete playlist.description;

	console.log(playlist);

	rss.channel = playlist;

	let xmlJson = { rss: rss };
	let xmlFile = js2xml.parse(xmlJson);
	console.log(xmlFile);
	if (xmlFile) {
		try {
			await uploadFile(xmlFile, list.guid);
		} catch (error) {
			publishingDisplay.set('Failed Publishing Playlist');
		}
	}

	setTimeout(() => {
		publishingDisplay.set('');
	}, 1000);

	// return { success: true, message: 'Play list published' };
}

async function uploadFile(xmlFile, guid) {
	var blob = new Blob([xmlFile], { type: 'text/xml;charset=utf-8' });
	let folderName = 'playlists';

	const formData = new FormData();

	// Append common fields
	formData.append('folderName', folderName);
	formData.append('fileName', `${guid}.xml`); // Constructed file name

	// Log the file name for debugging
	console.log('Uploading file with name:', formData.get('fileName'));

	try {
		// Add the file field last
		formData.append('file', blob);
		const response = await fetch(`${remoteServer}api/lnb/saveplaylist`, {
			method: 'POST',
			body: formData,
			credentials: 'include',
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			const result = await response.json();
			console.log(result);
		}

		const result = await response.json();

		console.log('Uploaded:', result);
		if (result.url) {
			console.log(result.url);
			await checkPodcastIndex(guid, result.url);
		}
	} catch (error) {
		console.error('Upload error:', error);
	}
}

async function checkPodcastIndex(guid, feedUrl) {
	const url = remoteServer + `api/queryindex?q=podcasts/byguid?guid=${guid}`;
	const res = await fetch(url);
	const data = await res.json();
	console.log(data);

	if (data.status === 'true' && data?.feed?.id) {
		console.log('podpinging feed');
		await podping(feedUrl);
	} else {
		console.log('adding feed');
		await addFeed(feedUrl);
	}
}

async function podping(feedUrl) {
	let url =
		remoteServer + `api/sf/podping?url=${encodeURIComponent(feedUrl)}&reason=update&medium=music`;

	console.log(url);
	try {
		const res = await fetch(url);
		const data = await res.text();
		if (data === 'Success!') {
			console.log('Podpinged');
			publishingDisplay.set('Playlist Successfully Updated');
		} else {
			publishingDisplay.set('Failed Publishing Playlist');
		}
	} catch (error) {
		publishingDisplay.set('Failed Publishing Playlist');
	}
}

async function addFeed(feedUrl) {
	try {
		let feed = remoteServer + `api/queryindex?q=add/byfeedurl?url=${encodeURIComponent(feedUrl)}`;

		const res = await fetch(feed);
		const data = await res.json();
		console.log(data);
		publishingDisplay.set(
			'Playlist added to the Index. It will be available to all the apps in a few minutes'
		);
	} catch (error) {
		publishingDisplay.set('Failed Publishing Playlist');
	}
}
