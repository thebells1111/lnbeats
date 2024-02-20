import localforage from 'localforage';
import { playlists } from '$/stores';
import { get } from 'svelte/store';

export async function addPlaylistToMasterList(playlistArgs) {
	const { name } = playlistArgs;
	const playlistDB = localforage.createInstance({
		name: 'playlistDB'
	});

	let pLists = get(playlists);

	const newGuid = generateV4Guid();
	let pL = {};

	pLists.add({ [newGuid]: name });
	playlists.set(pLists);
	playlistDB.setItem('msp-playlist-db', pLists);
	playlistDB.setItem(newGuid, { title: name, remoteItems: [] });
	return { success: true, message: 'Play list created' };
}

function generateV4Guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
