import localforage from 'localforage';
import { library } from '$/stores';

export async function deleteAlbum(album) {
	const libDB = localforage.createInstance({
		name: 'libDB'
	});

	let _library = (await libDB.getItem('library')) || {};

	delete _library[album.guid];
	delete _library[album.podcastGuid];

	library.set(_library);
	libDB.setItem('library', _library);
}
