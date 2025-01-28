import { playlists, playlistDB } from '$/stores';
import { get } from 'svelte/store';

export async function deleteSongFromPlaylist(song, _playlist) {
	let $playlists = get(playlists);

	if (!Object.keys($playlists).length) {
		$playlists = await playlistDB.getItem('playlists');
	}

	console.log(song);
	console.log(_playlist);

	_playlist.remoteSongs = _playlist.remoteSongs.filter((v) => {
		console.log(v?.['@_feedGuid'] === song?.podcastGuid);
		console.log(v?.['@_itemGuid'] === song?.guid);
		return !(v?.['@_feedGuid'] === song?.podcastGuid && v?.['@_itemGuid'] === song?.guid);
	});

	$playlists[_playlist.guid] = _playlist;
	playlists.set($playlists);
	await playlistDB.setItem('playlists', $playlists);
}
