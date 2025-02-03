import { playlists, playlistDB } from '$/stores';
import { get } from 'svelte/store';

export async function deletePlaylist(item) {
	let $playlists = get(playlists);

	if (!Object.keys($playlists).length) {
		$playlists = await playlistDB.getItem('playlists');
	}

	delete $playlists[item.podcastGuid];
	delete $playlists[item.guid];
	playlistDB.setItem('playlists', $playlists);
	playlists.set($playlists);
}
