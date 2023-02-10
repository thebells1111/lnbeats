<script>
	import { selectedAlbum } from '$/stores';
	import { saveAlbum } from '$functions/saveAlbum.js';
	import Add from '$icons/Add.svelte';
</script>

<button on:click={saveAlbum.bind(this, $selectedAlbum)}>
	<Add
		style={'color:var(--color-progressbar-0); filter: drop-shadow(0px 3px 2px rgb(0 0 0 / 0.4))'}
		size={50}
	/>
</button>

<style>
	button {
		margin: 0;
		padding: 0;
		border: none;
		background-color: transparent;
		width: 50px;
		height: 50px;
		border-radius: 50px;
		bottom: 8px;
		position: absolute;
		right: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
