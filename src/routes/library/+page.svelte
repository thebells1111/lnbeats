<script>
	import { encodeURL } from '$functions/songId';

	import AlbumCard from './AlbumCard.svelte';
	import CreatePlaylistButton from '$c/CreatePlaylist/CreatePlaylistButton.svelte';
	import OptionsMenu from './OptionsMenu.svelte';

	import { library } from '$/stores';

	let closerActive = false;
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
		{#each Object.entries($library) as [guid, album]}
			<li>
				{#if guid.includes('playlist-')}
					<a href={`/playlist/${encodeURL(album.title)}`}>
						<AlbumCard playlist={album.title} />
					</a>
					<OptionsMenu itemType="playlist" item={album.title} bind:closerActive />
				{:else}
					<a href={`/album/${guid}`}>
						<AlbumCard {album} />
					</a>
					<OptionsMenu itemType="album" item={album} bind:closerActive />
				{/if}
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
