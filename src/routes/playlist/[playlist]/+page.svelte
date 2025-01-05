<script>
	import RemoteSongCard from '$routes/album/[albumId]/RemoteSongCard.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { selectedAlbum, playlists, playlistDB, publishingDisplay, user } from '$/stores';
	import publishPlaylist from '$functions/publishPlaylist.js';
	import Upload from '$icons/Upload.svelte';

	export let data = {};

	let guid = data?.playlist;
	let playlist = {};
	let loading = true;

	onMount(async () => {
		$playlists = await playlistDB.getItem('playlists');
	});

	$: if (Object.keys($playlists).length) {
		playlist = $playlists[guid];
		playlist.remoteSongs = playlist.remoteSongs.filter((v) => v['@_feedGuid']);

		$selectedAlbum = playlist;

		if (!playlist) {
			goto(`/album/${guid}`, { replaceState: true });
		}

		loading = !playlist;
	}
</script>

<playlist-container>
	{#if !loading}
		{#if $user.name}
			<publishing>
				{#if $publishingDisplay}
					<p>{$publishingDisplay}</p>
				{:else if playlist?.remoteSongs?.length}
					<button on:click={publishPlaylist.bind(this, playlist)}>
						<Upload size="27" />
						Publish
					</button>
				{/if}
			</publishing>
		{/if}
		<h2>{playlist?.title || ''}</h2>

		<ul>
			{#if playlist?.remoteSongs?.length}
				{#each playlist.remoteSongs as remoteSong, index}
					<RemoteSongCard {remoteSong} {index} {playlist} />
				{/each}
			{:else}
				<p style="text-align:center">This playlist has no songs.</p>
				<p style="text-align:center">You should add some.</p>
			{/if}
		</ul>
	{/if}
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

	button {
		color: var(--color-text-0);
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.6em;
		background-color: transparent;
		text-decoration: underline;
	}

	publishing {
		display: flex;
		justify-content: end;
		position: absolute;
		top: 10px;
		right: 10px;
	}
</style>
