import localforage from 'localforage';
import { playingAlbum, selectedPlaylist, playingIndex } from '$/stores';
import { get } from 'svelte/store';

export async function deleteSongFromPlaylist(song, index) {
	const playlistDB = localforage.createInstance({
		name: 'playlistDB'
	});

	let list = song.playlist;
	let playlist = await playlistDB.getItem(list);

	let _playingAlbum = get(playingAlbum);
	let _selectedPlaylist = get(selectedPlaylist);

	playlist.splice(index, 1);

	if (index <= get(playingIndex)) {
		playingIndex.set(playingIndex - 1);
	}

	playlistDB.setItem(list, playlist);

	if (_playingAlbum.playlist === list) {
		_playingAlbum.songs = playlist;
		playingAlbum.set(_playingAlbum);
	}

	if (_selectedPlaylist.playlist === list) {
		_selectedPlaylist.songs = playlist;
		selectedPlaylist.set(_selectedPlaylist);
	}
}
