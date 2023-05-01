import localforage from 'localforage';
import { playlists } from '$/stores';
import { get } from 'svelte/store';

export async function addPlaylistToMasterList(playlistArgs) {
	const { name } = playlistArgs;
	const playlistDB = localforage.createInstance({
		name: 'playlistDB'
	});

	let pLists = get(playlists);

	if (pLists.has(name)) {
		return { success: false, message: 'This play list already exists' };
	}
	pLists.add(name);
	playlists.set(pLists);
	playlistDB.setItem('msp-playlist-db', pLists);
	playlistDB.setItem(name, []);
	return { success: true, message: 'Play list created' };
}
