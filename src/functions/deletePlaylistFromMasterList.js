import { library, playlistDB, libraryDB } from '$/stores';
import { get } from 'svelte/store';
import syncPlaylist from './syncPlaylist';
import syncLibrary from './syncLibrary';

export async function deletePlaylistFromMasterList(name) {
	playlistDB.removeItem(name);

	let _library = get(library);

	delete _library[`playlist-${name}`];

	libraryDB.setItem('library', _library);
	library.set(_library);
	syncPlaylist({ name, delete: true });
	syncLibrary(_library);
}
