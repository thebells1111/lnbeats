<script>
	import localforage from 'localforage';
	import QueueMusic from '$icons/QueueMusic.svelte';
	import { playlists, playingAlbum, selectedPlaylist } from '$/stores';
	import CreatePlaylistButton from './CreatePlaylistButton.svelte';
	export let song;
	let successList = '';

	async function addSongToPlaylist(guid) {
		const playlistDB = localforage.createInstance({
			name: 'playlistDB'
		});

		console.log(guid);

		const { artwork, image, podcastGuid, title, author } = song.album;
		song.album = { artwork, image, podcastGuid, title, author };
		song.playlist = guid;

		let playlist = (await playlistDB.getItem(guid)) || [];
		console.log(playlist);
		playlist.remoteItems = (playlist.remoteItems || []).concat(song);
		playlistDB.setItem(guid, playlist);
		if ($playingAlbum.playlist === guid) {
			$playingAlbum.songs = playlist.remoteItems;
		}
		if ($selectedPlaylist.playlist === guid) {
			$selectedPlaylist.songs = playlist.remoteItems;
		}
		successList = playlist.title;
		setTimeout(() => (successList = ''), 1000);
	}
</script>

<header>
	<h3>Add <i style="text-decoration: underline">{song.title}</i> to which playlist?</h3>
	<CreatePlaylistButton />
</header>
<ul>
	{#each [...$playlists].map((v) => {
		let [[key, value]] = Object.entries(v);
		return { guid: key, title: value };
	}) as list}
		<li on:click={addSongToPlaylist.bind(this, list.guid)}>
			<queue-icon>
				<QueueMusic size="55" />
			</queue-icon>
			<list-name>{list.title}</list-name>
		</li>
	{/each}
</ul>

{#if successList}
	<success-modal>
		<h1>{song.title} added to {successList}</h1>
	</success-modal>
{/if}

<style>
	header {
		display: flex;
		align-items: flex-end;
		margin-bottom: 8px;
	}
	header h3 {
		flex-grow: 1;
		margin: 0;
		padding-bottom: 8px;
	}

	i {
		font-size: 1.2em;
	}

	ul {
		padding: 0;
		margin: 4px 0;
	}
	li {
		display: flex;
		list-style-type: none;
		padding: 4px;
		margin: 0 4px;
		border-bottom: 1px solid var(--color-list-divider);
		display: flex;
		align-items: center;
	}
	queue-icon {
		min-width: 60px;
		max-width: 60px;
		max-height: 60px;
		margin-right: 8px;
		border-radius: 4px;
	}

	queue-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg-1);
	}

	success-modal {
		position: fixed;
		height: 100vh;
		width: 100vw;
		background-color: transparent;
		backdrop-filter: blur(5px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		top: 0;
		left: 0;
		z-index: 99;
	}

	success-modal h1 {
		text-align: center;
		background-color: red;
		margin: 16px;
		padding: 16px 0;
		border-radius: 8px;
		background-color: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(5px);
		color: var(--color-text-4);
		margin-top: 50px;
	}
</style>
