<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';
	import SongCard from './SongCard.svelte';

	import { selectedAlbum, posterSwiper, library } from '$/stores';

	export let data = {};

	if (browser && !data.album) {
		goto('/');
	}
	$selectedAlbum = data.album;

	let expandMenuOverride = false;
</script>

<svelte:head>
	{#if $selectedAlbum}
		<meta name="description" content={`${$selectedAlbum.author} - ${$selectedAlbum.title}`} />
		<meta property="og:site_name" content="LN Beats" />
		<meta property="og:title" content={`${$selectedAlbum.author} - ${$selectedAlbum.title}`} />
		<meta property="og:description" content="Listen on LN Beats" />
		<meta property="og:image" content={$selectedAlbum.artwork || $selectedAlbum.image} />
		<meta
			property="og:url"
			content={`https://musicsideproject.com/album/${$selectedAlbum.podcastGuid}`}
		/>

		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:title" content={`${$selectedAlbum.author} - ${$selectedAlbum.title}`} />
		<meta property="twitter:description" content="Listen on LN Beats" />
		<meta property="twitter:image" content={$selectedAlbum.artwork || $selectedAlbum.image} />
		<meta
			property="twitter:url"
			content={`https://musicsideproject.com/album/${$selectedAlbum.podcastGuid}`}
		/>
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
</style>
