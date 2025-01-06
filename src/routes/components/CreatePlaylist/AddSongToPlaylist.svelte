<script>
	import { v4 as uuidv4 } from 'uuid';
	import QueueMusic from '$icons/QueueMusic.svelte';
	import { playlists, playlistDB } from '$/stores';
	import CreatePlaylistButton from './CreatePlaylistButton.svelte';
	import { onMount } from 'svelte';
	export let song;
	let successList = '';

	onMount(async () => {
		if (!Object.keys($playlists).length) {
			$playlists = await playlistDB.getItem('playlists');
		}
	});

	async function addSongToPlaylist(guid) {
		let playlist = $playlists[guid];
		playlist.remoteSongs = playlist.remoteSongs || [];
		console.log(song);
		playlist.remoteSongs.push({
			id: uuidv4(),
			'@_feedGuid': song?.album?.podcastGuid,
			'@_itemGuid': song?.guid?.['#text'] || song?.guid
		});

		successList = playlist.title;
		await playlistDB.setItem('playlists', $playlists);
		setTimeout(() => (successList = ''), 1000);
	}
</script>

<header>
	<h3>Add <i style="text-decoration: underline">{song.title}</i> to which playlist?</h3>
	<CreatePlaylistButton />
</header>
<ul>
	{#each Object.entries($playlists) as [guid, list]}
		<li on:click={addSongToPlaylist.bind(this, guid)}>
			<queue-icon>
				<QueueMusic size="55" />
			</queue-icon>
			<list-name>{list.title}</list-name>
		</li>
	{/each}
</ul>

{#if successList}
	<success-modal>
		<h4>{song.title} added to {successList}</h4>
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

	success-modal h4 {
		text-align: center;
		background-color: red;
		margin: 16px;
		padding: 16px 0;
		border-radius: 8px;
		background-color: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(5px);
		color: var(--color-text-4);
		margin-top: 100px;
	}
</style>
