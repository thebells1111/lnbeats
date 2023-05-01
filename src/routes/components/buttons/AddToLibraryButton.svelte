<script>
	import { selectedAlbum } from '$/stores';
	import { saveAlbum } from '$functions/saveAlbum.js';
	import Add from '$icons/Add.svelte';
</script>

<button on:click={saveAlbum.bind(this, $selectedAlbum)}>
	<Add
		style={'color:var(--color-progressbar-0); filter: drop-shadow(0px 3px 2px rgb(0 0 0 / 0.4))'}
		size={110}
	/>
	<p>Add to Library</p>
</button>

<style>
	button {
		margin: 0;
		padding: 0;
		border: none;
		background-color: transparent;
		width: 60px;
		height: 65px;
		border-radius: 50%;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	p {
		color: var(--color-text-0);
		font-size: 0.6em;
		padding: 0;
		margin: 0;
	}
</style>
