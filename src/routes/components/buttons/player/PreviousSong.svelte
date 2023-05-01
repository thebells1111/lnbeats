<script>
	import loadSong from '$functions/loadSong';
	import SkipPrevious from '$icons/SkipPrevious.svelte';
	import { playingIndex } from '$/stores';
	export let size = 30;
	export let style;

	import { playingAlbum, playingSong } from '$/stores';

	function gotoPreviousSong() {
		let album = $playingAlbum;
		let currentSong = $playingSong;
		if (album?.songs && currentSong?.enclosure) {
			if ($playingIndex > 0) {
				$playingIndex = $playingIndex - 1;
				loadSong(album.songs[$playingIndex]);
			}
		}
	}
</script>

<button on:click={gotoPreviousSong} aria-label="Previous Song" {style}>
	<SkipPrevious {size} />
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
