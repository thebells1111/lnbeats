<script>
	import { player } from '$/stores';
	import NextSongIcon from '$icons/NextSong.svelte';
	export let size = 30;

	function seekForward(event) {
		event.preventDefault();
		$player.playbackRate = 6;
	}

	function stopSeekForward() {
		$player.playbackRate = 1;
	}
</script>

<button
	on:mousedown={seekForward}
	on:mouseup={stopSeekForward}
	on:touchstart={seekForward}
	on:touchend={stopSeekForward}
	aria-label="Fast Forward"
>
	<NextSongIcon {size} />
</button>

<style>
	button {
		border: none;
		padding: 0;
		margin: 0;
		background-color: transparent;
	}
</style>
