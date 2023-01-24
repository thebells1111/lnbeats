<script>
	import gotoNextSong from '$functions/gotoNextSong';
	import SkipNext from '$icons/SkipNext.svelte';
	export let size = 30;
	export let style;
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
