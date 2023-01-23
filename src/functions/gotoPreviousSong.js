import { playingAlbum, playingSong } from '$/stores';
import { get } from 'svelte/store';
import loadSong from './loadSong';

export default function gotoPreviousSong() {
	let songIndex = get(playingAlbum).songs.findIndex((song) => song.id === get(playingSong).id);
	if (songIndex > 0) {
		loadSong(get(playingAlbum).songs[songIndex - 1]);
	}
}
