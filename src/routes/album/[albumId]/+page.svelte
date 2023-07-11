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
