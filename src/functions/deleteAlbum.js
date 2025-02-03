import localforage from 'localforage';
import { library } from '$/stores';

export async function deleteAlbum(album) {
	const libraryDB = localforage.createInstance({
		name: 'libraryDB'
	});

	let _library = (await libraryDB.getItem('library')) || {};

	delete _library[album.guid];
	delete _library[album.podcastGuid];

	library.set(_library);
	libraryDB.setItem('library', _library);
}
