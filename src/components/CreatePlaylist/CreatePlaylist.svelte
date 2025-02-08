<script>
	import generateValidGuid from '$functions/generateValidGuid';

	import { playlists, playlistsDB, createPlaylistSwiper } from '$/stores';
	let title = '';
	let displayText = '';

	async function handleNewPlaylist() {
		if (!$playlists) {
			$playlists = (await playlistsDB.getItem('playlists')) || {};
		}

		let guid = await generateValidGuid();
		let playlist = { podcastGuid: guid, artwork: '/playlist60x60.png', title, remoteSongs: [] };

		$playlists[guid] = playlist;
		await playlistsDB.setItem('playlists', $playlists);

		$createPlaylistSwiper.slideTo(0);
		setTimeout(() => {
			document.getElementById('create-playlist-swiper').style.visibility = 'hidden';
			title = '';
			displayText = '';
		}, 500);
	}
</script>

<div>
	<label
		>Create New Playlist
		<input type="text" bind:value={title} />
	</label>
	<button on:click={handleNewPlaylist} disabled={!title}>Save</button>
	<h2>{displayText}</h2>
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
	}
	label {
		display: flex;
		flex-direction: column;
	}
	input {
		width: calc(100% - 16px);
		margin: 4px 8px;
	}

	button {
		width: 100px;
		height: 33px;
		border-radius: 8px;
		align-self: flex-end;
		margin: 8px;
		background-color: var(--color-bg-button-0);
		color: var(--color-text-0);
		font-weight: 600;
	}

	button:disabled {
		background-color: var(--color-bg-button-disabled-0);
		color: hsla(0, 0%, 0%, 0.5);
		cursor: not-allowed;
	}
</style>
