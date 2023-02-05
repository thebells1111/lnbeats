<script>
	import { player } from '$/stores';
	import NextSongIcon from '$icons/NextSong.svelte';
	export let size = 30;
	export let style;

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
	{style}
>
	<NextSongIcon {size} />
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
