<script>
	import localforage from 'localforage';
	import { onMount } from 'svelte';

	import AlbumCard from './AlbumCard.svelte';
	import CreatePlaylistButton from '$c/CreatePlaylist/CreatePlaylistButton.svelte';
	import OptionsMenu from './OptionsMenu.svelte';

	import { library, playlists, albumSearch, favoritesDB, favorites, playlistDB } from '$/stores';

	let closerActive = false;

	onMount(async () => {
		if (!Object.keys($library).length) {
			$albumSearch = '';
			const libraryDB = localforage.createInstance({
				name: 'libraryDB'
			});

			$library = (await libraryDB.getItem('library')) || {};
			console.log($library);

			const _playlists = await playlistDB.getItem('playlists');
			if (!_playlists) {
				localforage
					.dropInstance({
						name: 'playlistDB'
					})
					.then(() => {
						console.log('database reset');
					})
					.catch((err) => {
						console.error('Error deleting database:', err);
					});
			}

			$playlists = _playlists || {};

			console.log($playlists);
		}

		if (!Object.keys($favorites).length) {
			$favorites = (await favoritesDB.getItem('favoritesList')) || {};
		}
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
		<li>
			<a href={`/playlist/favorites`}>
				<AlbumCard {favorites} />
			</a>
		</li>

		{#each Object.entries($playlists) as [guid, album]}
			<li>
				<a href={`/playlist/${guid}`}>
					<AlbumCard {album} playlist="true" />
				</a>
				<OptionsMenu itemType="playlist" item={album} bind:closerActive />
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
