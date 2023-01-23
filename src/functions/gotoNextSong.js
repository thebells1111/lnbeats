import { playingAlbum, playingSong } from '$/stores';
import { get } from 'svelte/store';
import loadSong from './loadSong';

export default function gotoNextSong() {
	let songIndex = get(playingAlbum).songs.findIndex((song) => song.id === get(playingSong).id);
	if (songIndex > -1) {
		if (songIndex < get(playingAlbum).songs.length - 1) {
			loadSong(get(playingAlbum).songs[songIndex + 1]);
		}
	}
}
