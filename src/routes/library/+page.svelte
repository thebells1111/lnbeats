<script>
	import localforage from 'localforage';
	import { onMount } from 'svelte';
	import { encodeURL } from '$functions/songId';

	import AlbumCard from './AlbumCard.svelte';
	import CreatePlaylistButton from '$c/CreatePlaylist/CreatePlaylistButton.svelte';
	import OptionsMenu from './OptionsMenu.svelte';

	import { library, playlists } from '$/stores';

	let closerActive = false;

	onMount(async () => {
		const libraryDB = localforage.createInstance({
			name: 'libraryDB'
		});

		$library = (await libraryDB.getItem('library')) || {};
	});
</script>

<!-- svelte-ignore component-name-lowercase -->
<library>
	<header>
		<h2>Library</h2>
		<create-button>
			<CreatePlaylistButton />
		</create-button>
	</header>

	<ul>
		{#each [...$playlists] as playlist}
			<li>
				<a href={`/playlist/${encodeURL(playlist)}`}>
					<AlbumCard {playlist} />
				</a>
				<OptionsMenu itemType="playlist" item={playlist} bind:closerActive />
			</li>
		{/each}

		{#each Object.entries($library) as [guid, album]}
			<li>
				<a href={`/album/${guid}`}>
					<AlbumCard {album} />
				</a>
				<OptionsMenu itemType="album" item={album} bind:closerActive />
			</li>
		{/each}
	</ul>
</library>

<style>
	library {
		position: relative;
		display: block;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 65px;
		padding: 0 12px;
		margin-bottom: 26px;
		position: relative;
		overflow: hidden;
	}

	create-button {
		position: relative;
		top: 8px;
		left: 24px;
	}

	h2 {
		margin: 0;
		font-family: 'Charm', cursive;
		font-weight: 700;
		font-size: 2em;
	}
	ul {
		padding: 0;
		margin: 4px 0;
	}
	li {
		list-style-type: none;
		padding: 4px;
		margin: 0 4px;
		border-bottom: 1px solid var(--color-list-divider);
		display: flex;
		align-items: center;
	}

	a {
		flex-grow: 1;
	}
</style>
