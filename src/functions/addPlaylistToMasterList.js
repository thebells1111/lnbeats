import localforage from 'localforage';
import { library, libraryDB, playlistDB } from '$/stores';
import { get } from 'svelte/store';
import syncPlaylist from './syncPlaylist';
import syncLibrary from './syncLibrary';

export async function addPlaylistToMasterList(playlistArgs) {
	const { name } = playlistArgs;

	let _library = get(library);
	if (_library[`playlist-${name}`]) {
		return { success: false, message: 'This play list already exists' };
	}
	let psuedoAlbum = {
		type: 'playlist',
		guid: `playlist-${name}`,
		title: name
	};

	_library[psuedoAlbum.guid] = psuedoAlbum;

	libraryDB.setItem('library', _library);
	library.set(_library);

	playlistDB.setItem(name, []);

	syncPlaylist({ name, playlist: [] });
	syncLibrary(_library);

	return { success: true, message: 'Play list created' };
}
