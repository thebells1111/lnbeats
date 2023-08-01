import localforage from 'localforage';
import { library } from '$/stores';

export async function convertAlbumIdtoGuid(id, guid) {
	const albumDB = localforage.createInstance({
		name: 'albumDB'
	});
	const libraryDB = localforage.createInstance({
		name: 'libraryDB'
	});

	// Retrieve the album using id
	let album = await albumDB.getItem(id.toString());

	if (!album) {
		throw new Error(`Album with id ${id} not found.`);
	}

	// Modify album object: replace id with guid and delete id
	album.guid = guid;
	delete album.id;

	// Delete the original album with the id key
	await albumDB.removeItem(id.toString());

	// Store the modified album object using guid as the key
	albumDB.setItem(guid, album);

	let _library = (await libraryDB.getItem('library')) || {};

	// Delete the album entry with id key in _library object
	delete _library[id];

	// Replace album.id with guid as the key and store album data without id
	_library[guid] = {
		title: album.title,
		art: album.image || album.artwork,
		url: album.url,
		lastUpdateTime: album.lastUpdateTime,
		guid: guid // Store guid instead of id
	};

	library.set(_library);
	libraryDB.setItem('library', _library);
}
