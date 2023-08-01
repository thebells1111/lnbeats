import localforage from 'localforage';
import { library } from '$/stores';
import { get } from 'svelte/store';

export async function deleteAlbum(album) {
	const albumDB = localforage.createInstance({
		name: 'albumDB'
	});
	const libraryDB = localforage.createInstance({
		name: 'libraryDB'
	});
	albumDB.removeItem(album.guid.toString());
	albumDB.removeItem(album.podcastGuid);

	let _library = (await libraryDB.getItem('library')) || {};

	delete _library[album.guid];
	delete _library[album.podcastGuid];

	library.set(_library);
	libraryDB.setItem('library', _library);
}
