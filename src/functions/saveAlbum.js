import localforage from 'localforage';
import { library } from '$/stores';

export async function saveAlbum(album) {
	const libraryDB = localforage.createInstance({
		name: 'libraryDB'
	});
	const podcastGuid = album.podcastGuid.toString();

	let _library = (await libraryDB.getItem('library')) || {};

	_library[podcastGuid] = {
		title: album?.title || '',
		artwork: album?.image || album?.artwork || '',
		author: album?.author || '',
		id: album?.id,
		description: album?.description || '',
		url: album?.url || '',
		lastUpdateTime: album?.lastUpdateTime || '',
		podcastGuid
	};

	library.set(_library);
	libraryDB.setItem('library', _library);
}
