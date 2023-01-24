<script>
	import gotoPreviousSong from '$functions/gotoPreviousSong';
	import SkipPrevious from '$icons/SkipPrevious.svelte';
	export let size = 30;
	export let style;
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
