import localforage from 'localforage';
import { playlists } from '$/stores';
import { get } from 'svelte/store';

export async function deletePlaylistFromMasterList(name) {
	const playlistDB = localforage.createInstance({
		name: 'playlistDB'
	});

	let pLists = get(playlists);

	pLists.delete(name);
	playlists.set(pLists);
	playlistDB.removeItem(name);
}
