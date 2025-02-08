import { playlists, playlistsDB } from '$/stores';
import { get } from 'svelte/store';

export async function deleteSongFromPlaylist(song, _playlist) {
	let $playlists = get(playlists);

	if (!Object.keys($playlists).length) {
		$playlists = await playlistsDB.getItem('playlists');
	}

	_playlist.remoteSongs = _playlist.remoteSongs.filter((v) => {
		return !(v?.['@_feedGuid'] === song?.podcastGuid && v?.['@_itemGuid'] === song?.guid);
	});

	console.log([_playlist.podcastGuid]);

	$playlists[_playlist.podcastGuid] = _playlist;
	playlists.set($playlists);
	await playlistsDB.setItem('playlists', $playlists);
}
