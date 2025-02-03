<script>
	import localforage from 'localforage';
	import { onMount } from 'svelte';
	import loadAlbum from '$functions/loadAlbum';

	import AlbumCard from './AlbumCard.svelte';
	import CreatePlaylistButton from '$c/CreatePlaylist/CreatePlaylistButton.svelte';
	import OptionsMenu from './OptionsMenu.svelte';

	import { library, playlists, albumSearch, favorites, playlistDB, activeScreen } from '$/stores';

	onMount(async () => {
		if (!Object.keys($library).length) {
			$albumSearch = '';
			const libraryDB = localforage.createInstance({
				name: 'libraryDB'
			});

			const _library = (await libraryDB.getItem('library')) || {};

			const lib = await Promise.all(
				Object.keys(_library).map((key) => {
					const v = _library[key]; // Ensure correct value reference
					return v.podcastGuid ? Promise.resolve(v) : loadAlbum(v.guid);
				})
			);

			lib.forEach((v) => {
				console.log(v);
				$library[v.podcastGuid] = {
					artwork: v.artwork,
					author: v.author,
					description: v.description,
					id: v.id,
					podcastGuid: v.podcastGuid,
					title: v.title,
					url: v.url
				};
			});

			console.log($library);

			libraryDB.setItem('library', $library);
		}

		if (!Object.keys($playlists).length) {
			let _playlists = (await playlistDB.getItem('playlists')) || {};

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

			Object.keys(_playlists)?.forEach((key) => {
				let v = _playlists[key];
				$playlists[key] = {
					artwork: v?.artwork || v?.art || '',
					author: v?.author || '',
					description: v?.description || '',
					podcastGuid: v?.podcastGuid || v?.guid || '',
					title: v?.title || '',
					url: v?.url || '',
					remoteSongs: v?.remoteSongs || []
				};
			});
			$playlists.favorites = $playlists.favorites || {
				title: 'Favorites',
				artwork: '/favorites60x60.png',
				remoteSongs: []
			};

			playlistDB.setItem('playlists', $playlists);
			$favorites = $playlists?.favorites;
		}
	});
</script>

<!-- svelte-ignore component-name-lowercase -->
<library class:show={$activeScreen === 'library'}>
	<header>
		<h2>Library</h2>
		<create-button>
			<CreatePlaylistButton />
		</create-button>
	</header>

	<ul>
		<li>
			<AlbumCard album={$favorites} />
		</li>

		{#each Object.entries($playlists) as [guid, album]}
			{#if guid !== 'favorites'}
				<li>
					<AlbumCard {album} playlist={true} />
					<OptionsMenu itemType="playlist" item={album} playlist={album} />
				</li>
			{/if}
		{/each}

		{#each Object.entries($library) as [guid, album]}
			<li>
				<AlbumCard {album} />

				<OptionsMenu itemType="album" item={album} />
			</li>
		{/each}
	</ul>
</library>

<style>
	library {
		display: none;
	}

	.show {
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
		justify-content: space-between;
	}

	a {
		flex-grow: 1;
	}
</style>
