import localforage from 'localforage';
import { library } from '$/stores';
import { get } from 'svelte/store';

export async function saveAlbum(album) {
	console.log(album);
	const albumDB = localforage.createInstance({
		name: 'albumDB'
	});
	const libraryDB = localforage.createInstance({
		name: 'libraryDB'
	});
	albumDB.setItem(album.id.toString(), album);

	let _library = (await libraryDB.getItem('library')) || {};

	_library[album.id] = {
		title: album.title,
		art: album.image || album.artwork,
		url: album.url,
		lastUpdateTime: album.lastUpdateTime,
		id: album.id
	};

	library.set(_library);
	libraryDB.setItem('library', _library);
}
