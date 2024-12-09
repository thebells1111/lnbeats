<script>
	import localforage from 'localforage';
	import SongCard from '$routes/album/[albumId]/SongCard.svelte';
	import { onMount } from 'svelte';
	import { selectedPlaylist } from '$/stores';
	import publishPlaylist from '$functions/publishPlaylist.js';

	export let data = {};

	onMount(async () => {
		const playlistDB = localforage.createInstance({
			name: 'playlistDB'
		});

		($selectedPlaylist.playlist = data.playlist),
			($selectedPlaylist.songs = (await playlistDB.getItem(data.playlist)) || []);
	});
</script>

<playlist-container>
	<h2>{data.playlist || ''}</h2>
	{#if $selectedPlaylist?.songs?.length}
		<button on:click={publishPlaylist.bind(this, $selectedPlaylist)}>Publish</button>
	{/if}
	<ul>
		{#each $selectedPlaylist.songs || [] as song, index}
			<SongCard {song} {index} />
		{/each}
	</ul>
</playlist-container>

<style>
	h2 {
		padding: 8px;
		margin: 0;
		text-align: center;
	}
	ul {
		padding: 0;
		margin: 4px 0;
	}
</style>
