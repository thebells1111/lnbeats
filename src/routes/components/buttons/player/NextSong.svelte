<script>
	// import gotoNextSong from '$functions/gotoNextSong';
	import loadSong from '$functions/loadSong';
	import SkipNext from '$icons/SkipNext.svelte';
	export let size = 30;
	export let style;

	import { playingAlbum, playingSong } from '$/stores';

	function gotoNextSong() {
		let album = $playingAlbum;
		let currentSong = $playingSong;
		if (album?.songs && currentSong?.enclosure) {
			let songIndex = album.songs.findIndex(
				(song) => song.enclosure['@_url'] === currentSong.enclosure['@_url']
			);
			if (songIndex > -1 && songIndex < album.songs.length - 1) {
				loadSong(album.songs[songIndex + 1]);
			}
		}
	}
</script>

<button on:click={gotoNextSong} aria-label="Next Song" {style}>
	<SkipNext {size} />
</button>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		padding: 0;
		margin: 0;
		background-color: transparent;
		width: 45px;
		height: 45px;
	}
</style>
