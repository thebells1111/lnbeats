<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { deleteAlbum } from '$functions/deleteAlbum';

	import SongCard from './SongCard.svelte';
	import RemoteSongCard from './RemoteSongCard.svelte';
	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';

	import {
		selectedAlbum,
		playingAlbum,
		library,
		playingSongList,
		remotePlaylistPlaying
	} from '$/stores';

	export let album;
	let expandDescription = false;
	let descriptionEl;

	$selectedAlbum = album;
	let songList = album?.songs?.length ? album.songs : album.remoteSongs;

	async function removeAlbum() {
		const album = { guid: $page.params.albumId };
		await deleteAlbum(album);
		goto('/library', { replaceState: true });
	}

	function isOverflowingHorizontally(element) {
		return element?.scrollHeight > element?.clientHeight;
	}
</script>

{#if album}
	<ul>
		<header>
			<img src={album.image || album.artwork} />
			<h2>{album.title}</h2>
			{#if !$library[album.podcastGuid]}
				<add-button>
					<AddToLibraryButton />
				</add-button>
			{/if}
		</header>
		<description
			on:click={() => {
				expandDescription = !expandDescription;
			}}
		>
			<p bind:this={descriptionEl} class:expand={expandDescription}>{album.description}</p>
			{#if isOverflowingHorizontally(descriptionEl)}
				<p class="arrows" class:expand={expandDescription}>{expandDescription ? '▲' : '▼'}</p>
			{/if}
		</description>

		{#if album?.songs?.length}
			{#each $playingAlbum.id === album.id ? $playingSongList : album.songs as song, index}
				<SongCard {album} {song} {index} />
			{/each}
		{:else if album?.remoteSongs?.length}
			{#each album.remoteSongs as remoteSong, index}
				<RemoteSongCard {album} {remoteSong} {index} />
			{/each}
		{/if}
	</ul>
{:else}
	<h3>It appears this Album is no longer available.</h3>
	<h3>Would you like to remove it from your library?</h3>
	<button on:click={removeAlbum} class="primary">Remove</button>
{/if}

<style>
	header {
		display: flex;
		position: relative;
		overflow: hidden;
	}
	ul {
		margin: 0;
		padding: 0;
	}

	h2 {
		flex: 1;
	}

	description {
		display: block;
		position: relative;
	}
	p {
		margin: 0px 20px 4px 8px;
		line-height: 1.2em;
		overflow: hidden;
		height: 1.2em;
		color: var(--color-theme-yellow-light);
	}
	p.expand {
		overflow: initial;
		white-space: initial;
		height: initial;
		padding-bottom: 8px;
	}

	p.arrows {
		width: 20px;
		height: 1.2em;
		background-color: transparent;
		position: absolute;
		right: -16px;
		top: 0em;
	}

	img {
		width: 100px;
		height: 100px;
		border-radius: 8px;
		margin: 8px;
	}

	add-button {
		position: relative;
		margin: 8px 16px 0 0;
	}

	h3 {
		text-align: center;
		margin: 4px;
	}

	h3:first-of-type {
		margin-top: 60px;
	}
	button {
		width: calc(100% - 32px);
		max-width: 350px;
		height: 33px;
		border-radius: 8px;
		margin: 8px;
		background-color: var(--color-bg-button-0);
		color: var(--color-text-0);
		font-weight: 600;
		align-self: center;
	}
</style>
