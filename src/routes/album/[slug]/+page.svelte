<script>
	export let data = {};
	import PlayPauseButton from '$buttons/player/PlayPauseButton.svelte';
	import { selectedAlbum } from '$/stores';
	$selectedAlbum = data.album;
	console.log($selectedAlbum);
	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';
</script>

<ul>
	<h1>{$selectedAlbum.title}</h1>
	<AddToLibraryButton />
	{#each $selectedAlbum.songs as song}
		<li>
			<PlayPauseButton {song} album={$selectedAlbum} />
			<p>{song.title}</p>
		</li>
	{/each}
</ul>

<style>
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		list-style: none;
		justify-content: space-between;
	}

	p {
		text-align: left;
		width: 100%;
		margin-left: 8px;
	}
</style>
