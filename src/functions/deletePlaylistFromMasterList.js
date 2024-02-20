import localforage from 'localforage';
import { playlists } from '$/stores';
import { get } from 'svelte/store';

export async function deletePlaylistFromMasterList(playlist) {
	const playlistDB = localforage.createInstance({
		name: 'playlistDB'
	});

	let pListsArray = Array.from(get(playlists));
	let indexToDelete = pListsArray.findIndex((obj) => obj.hasOwnProperty(playlist.guid));
	if (indexToDelete !== -1) {
		pListsArray.splice(indexToDelete, 1);
	}
	let pLists = new Set(pListsArray);

	playlists.set(pLists);
	playlistDB.setItem('msp-playlist-db', pLists);
	playlistDB.removeItem(playlist.guid);
}
