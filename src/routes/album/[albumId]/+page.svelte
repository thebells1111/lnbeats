<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import { convertAlbumIdtoGuid } from '$functions/covertAlbumIdToGuid';
	import { deleteAlbum } from '$functions/deleteAlbum';

	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';
	import SongCard from './SongCard.svelte';

	import { selectedAlbum, posterSwiper, library } from '$/stores';

	export let data = {};
	if (browser) {
		if (data.album) {
			if (data.redirect) {
				let guid = data.redirect.split('/')[2];
				convertAlbumIdtoGuid($page.params.albumId, guid);
				goto(data.redirect, { replaceState: true });
			}
		}
	}
	$selectedAlbum = data.album;

	let expandMenuOverride = false;

	async function removeAlbum() {
		const album = { guid: $page.params.albumId };
		await deleteAlbum(album);
		goto('/library', { replaceState: true });
	}
</script>

<svelte:head>
	{#if data.album}
		<title>{`${$selectedAlbum.author} - ${data.album.title}`}</title>
		<meta name="description" content={`${data.album.author} - ${data.album.title}`} />
		<meta property="og:site_name" content="LN Beats" />
		<meta property="og:title" content={`${data.album.author} - ${data.album.title}`} />
		<meta property="og:description" content="Listen on LN Beats" />
		<meta property="og:image" content={data.album.artwork || data.album.image} />
		<meta property="og:url" content={`https://lnbeats.com/album/${data.album.podcastGuid}`} />

		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:title" content={`${data.album.author} - ${data.album.title}`} />
		<meta property="twitter:description" content="Listen on LN Beats" />
		<meta property="twitter:image" content={data.album.artwork || data.album.image} />
		<meta property="twitter:url" content={`https://lnbeats.com/album/${data.album.podcastGuid}`} />
	{/if}
</svelte:head>

{#if $selectedAlbum}
	<ul>
		<header>
			<img src={$selectedAlbum.image || $selectedAlbum.artwork} />
			<h2>{$selectedAlbum.title}</h2>
			{#if !$library[$selectedAlbum.podcastGuid]}
				<add-button>
					<AddToLibraryButton />
				</add-button>
			{/if}
		</header>

		{#each $selectedAlbum.songs as song, index}
			<SongCard {song} {index} />
		{/each}
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
		flex-grow: 1;
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
