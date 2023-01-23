<script>
	import gotoNextSong from '$functions/gotoNextSong';
	import NextSongIcon from '$icons/NextSong.svelte';
	export let size = 30;
</script>

<button on:click={gotoNextSong} aria-label="Next Song">
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
