<script>
	import gotoPreviousSong from '$functions/gotoPreviousSong';
	import PreviousSongIcon from '$icons/PreviousSong.svelte';
	export let size = 30;
</script>

<button on:click={gotoPreviousSong} aria-label="Previous Song">
	<PreviousSongIcon {size} />
</button>

<style>
	button {
		border: none;
		padding: 0;
		margin: 0;
		background-color: transparent;
	}
</style>
