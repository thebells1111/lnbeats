import { playlists, playlistsDB } from '$/stores';
import { get } from 'svelte/store';

export async function deletePlaylist(item) {
	let $playlists = get(playlists);

	if (!Object.keys($playlists).length) {
		$playlists = await playlistsDB.getItem('playlists');
	}

	delete $playlists[item.podcastGuid];
	delete $playlists[item.guid];
	playlistsDB.setItem('playlists', $playlists);
	playlists.set($playlists);
}
