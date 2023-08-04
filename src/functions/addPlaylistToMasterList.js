import localforage from 'localforage';
import { playlists, library } from '$/stores';
import { get } from 'svelte/store';
import syncPlaylist from './syncPlaylist';

export async function addPlaylistToMasterList(playlistArgs) {
	const { name } = playlistArgs;
	const playlistDB = localforage.createInstance({
		name: 'playlistDB'
	});

	let pLists = get(playlists);

	if (pLists.has(name)) {
		return { success: false, message: 'This play list already exists' };
	}
	let psuedoAlbum = {
		type: 'playlist',
		guid: `playlist-${name}`,
		title: name
	};

	let _library = get(library);
	console.log(_library);
	_library[psuedoAlbum.guid] = psuedoAlbum;
	const libraryDB = localforage.createInstance({
		name: 'libraryDB'
	});
	libraryDB.setItem('library', _library);

	pLists.add(name);
	playlists.set(pLists);
	playlistDB.setItem('msp-playlist-db', pLists);
	playlistDB.setItem(name, []);

	console.log(pLists);

	syncPlaylist({ master: [...pLists], name, playlist: [] });

	return { success: true, message: 'Play list created' };
}
