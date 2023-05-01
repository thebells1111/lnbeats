import localforage from 'localforage';
import { library } from '$/stores';
import { get } from 'svelte/store';

export async function deleteAlbum(album) {
	console.log(album);
	const albumDB = localforage.createInstance({
		name: 'albumDB'
	});
	const libraryDB = localforage.createInstance({
		name: 'libraryDB'
	});
	albumDB.removeItem(album.guid.toString());

	let _library = (await libraryDB.getItem('library')) || {};

	delete _library[album.guid];

	library.set(_library);
	libraryDB.setItem('library', _library);
}
