<script>
	import { v4 as uuidv4 } from 'uuid';
	import Modals from '$c/Modals/Modals.svelte';
	import RemoteSongCard from '$c/Album/RemoteSongCard.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { selectedAlbum, playlists, playlistDB, publishingDisplay, user } from '$/stores';
	import publishPlaylist from '$functions/publishPlaylist.js';
	import Upload from '$icons/Upload.svelte';
	import EditSquare from '$icons/EditSquare.svelte';
	import Edit from './Edit.svelte';

	export let data = {};

	let guid = data?.guid;
	let playlist = {};
	let loading = true;

	onMount(async () => {
		$playlists = await playlistDB.getItem('playlists');
	});

	$: if (Object.keys($playlists).length) {
		playlist = $playlists[guid];
		if (!playlist) {
			goto(`/album/${guid}`, { replaceState: true });
		} else {
			playlist.remoteSongs = playlist.remoteSongs
				.filter((v) => v?.['@_feedGuid'])
				.map((v) => {
					if (!v?.id) {
						v.id = uuidv4();
					}
					return v;
				});

			$selectedAlbum = playlist;

			loading = !playlist;
		}
	}
</script>

<playlist-container>
	{#if !loading}
		{#if $user.name}
			<publishing>
				<spacer />
				{#if $publishingDisplay}
					<p>{$publishingDisplay}</p>
				{:else if playlist?.remoteSongs?.length}
					<button on:click={publishPlaylist.bind(this, playlist)}>
						<Upload size="27" />
						Publish
					</button>
				{/if}
				<button
					on:click={() => {
						showModal = true;
					}}
					class="edit"
				>
					<EditSquare size="24" />
					Edit
				</button>
			</publishing>
		{/if}
		<h2>{playlist?.title || ''}</h2>

		<ul>
			{#if playlist && playlist?.remoteSongs?.length}
				{#each playlist.remoteSongs as remoteSong, index (remoteSong.id)}
					<RemoteSongCard album={playlist} {remoteSong} {index} {playlist} />
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
		justify-content: center;
		width: 45px;
		height: 45px;
		align-items: center;
		font-size: 0.6em;
		background-color: transparent;
		text-decoration: underline;
		min-width: 45px;
		height: 45px;
	}

	.edit {
		justify-content: space-evenly;
	}

	publishing {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: absolute;
		top: 0;
		width: calc(100% - 45px);
		min-height: 50px;
		max-height: 50px;
		margin-left: 45px;
	}
</style>
