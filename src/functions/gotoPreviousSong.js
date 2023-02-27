import { playingAlbum, playingSong } from '$/stores';
import { get } from 'svelte/store';
import loadSong from './loadSong';

export default function gotoPreviousSong() {
	let album = get(playingAlbum);
	let currentSong = get(playingSong);
	if (album?.songs && currentSong?.enclosure) {
		let songIndex = album.songs.findIndex(
			(song) => song.enclosure['@_url'] === currentSong.enclosure['@_url']
		);
		if (songIndex > 0) {
			loadSong(album.songs[songIndex - 1]);
		}
	}
}
