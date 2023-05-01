<script>
	// import gotoNextSong from '$functions/gotoNextSong';
	import loadSong from '$functions/loadSong';
	import SkipNext from '$icons/SkipNext.svelte';
	export let size = 30;
	export let style;

	import { playingAlbum, playingSong, playingIndex } from '$/stores';

	function gotoNextSong() {
		let album = $playingAlbum;
		let currentSong = $playingSong;
		if (album?.songs && currentSong?.enclosure) {
			if ($playingIndex > -1 && $playingIndex < album.songs.length - 1) {
				$playingIndex = $playingIndex + 1;
				loadSong(album.songs[$playingIndex]);
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
