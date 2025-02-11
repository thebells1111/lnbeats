<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { deleteAlbum } from '$functions/deleteAlbum';

	import SongCard from './SongCard.svelte';
	import RemoteSongCard from './RemoteSongCard.svelte';

	import publishPlaylist from '$functions/publishPlaylist.js';

	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';
	import Modals from '$c/Modals/Modals.svelte';
	import SmallModal from '$c/Modals/SmallModal.svelte';
	import Upload from '$icons/Upload.svelte';
	import EditSquare from '$icons/EditSquare.svelte';

	import Edit from './Edit.svelte';

	import {
		selectedAlbum,
		playingAlbum,
		playingSongList,
		albumSwiper,
		playlists,
		playlistsDB,
		publishingDisplay,
		user,
		library
	} from '$/stores';

	export let album;
	let expandDescription = false;
	let descriptionEl;
	let showModal = false;

	$: if ($playlists && album.id !== 6612768) {
		album.remoteSongs = album.remoteSongs;
	}

	if ($albumSwiper?.activeIndex === 0) {
		$selectedAlbum = album;
	}

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
	<container>
		<header>
			{#if album?.author?.includes('ovvrdos')}
				<censored>Censored</censored>
			{/if}
			<img src={album.image || album.artwork} />

			<h2>{album.title}</h2>
			{#if album.songs && !$library?.[album?.podcastGuid]}
				<add-button>
					<AddToLibraryButton />
				</add-button>
			{/if}
		</header>
		<ul>
			<description
				on:click={() => {
					expandDescription = !expandDescription;
				}}
			>
				<p bind:this={descriptionEl} class:expand={expandDescription}>{album.description || ''}</p>
				{#if isOverflowingHorizontally(descriptionEl)}
					<p class="arrows" class:expand={expandDescription}>{expandDescription ? '▲' : '▼'}</p>
				{/if}
			</description>

			{#if album?.songs?.length}
				<ul class="no-scroll">
					{#each $playingAlbum.id === album.id ? $playingSongList : album.songs as song, index}
						<SongCard {album} {song} {index} />
					{/each}
				</ul>
			{:else if album?.remoteSongs?.length}
				{#if $user.name && $playlists?.[album?.podcastGuid]}
					<publishing>
						{#if album?.remoteSongs?.length}
							<button on:click={publishPlaylist.bind(this, album)}>
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
						<spacer />
					</publishing>
				{/if}
				<ul class="no-scroll">
					{#each album.remoteSongs as remoteSong, index}
						<RemoteSongCard {album} {remoteSong} {index} />
					{/each}
				</ul>
			{/if}
		</ul>
	</container>
{:else}
	<h3>It appears this Album is no longer available.</h3>
	<h3>Would you like to remove it from your library?</h3>
	<button on:click={removeAlbum} class="primary">Remove</button>
{/if}

<Modals
	bind:showModal
	onClose={async () => {
		playlistsDB.setItem('playlists', $playlists);
	}}
>
	<Edit bind:album />
</Modals>

{#if $publishingDisplay}
	<SmallModal
		onClose={() => {
			$publishingDisplay = '';
		}}
	>
		<publishing-display>{$publishingDisplay}</publishing-display>
	</SmallModal>
{/if}

<style>
	container {
		display: block;
		height: calc(100% - 8px);
		overflow: auto;
	}
	header {
		display: flex;
		position: relative;
		overflow: hidden;
		margin: 8px 0;
	}
	ul {
		margin: 0;
		padding: 0;
	}

	h2 {
		flex: 1;
		margin: 4px 0;
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
		margin: 0 8px;
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

	publishing > button {
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
	}

	publishing-display {
		color: var(--color-theme-yellow-light);
		font-size: 1.1em;
		font-weight: 600;
	}

	censored {
		display: flex;
		background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
		width: 100px;
		height: 100px;
		border-radius: 8px;
		margin: 0 8px;
		align-items: center;
		justify-content: center;
		position: absolute;
		backdrop-filter: blur(5px); /* Blurs everything behind it */
		-webkit-backdrop-filter: blur(5px); /* For Safari support */
	}
</style>
