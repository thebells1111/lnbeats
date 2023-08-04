import localforage from 'localforage';
import { library, remoteServer } from '$/stores';
import { get } from 'svelte/store';

export async function saveAlbum(album) {
	const albumDB = localforage.createInstance({
		name: 'albumDB'
	});
	const libraryDB = localforage.createInstance({
		name: 'libraryDB'
	});
	const guid = album.podcastGuid.toString();
	albumDB.setItem(guid, album);

	let _library = (await libraryDB.getItem('library')) || {};

	_library[guid] = {
		title: album.title,
		art: album.image || album.artwork,
		url: album.url,
		lastUpdateTime: album.lastUpdateTime,
		guid
	};

	library.set(_library);
	await libraryDB.setItem('library', _library);
}
