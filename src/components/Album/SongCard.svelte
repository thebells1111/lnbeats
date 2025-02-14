<script>
	import clone from 'just-clone';
	import loadSong from '$functions/loadSong';
	import { slide } from 'svelte/transition';
	import MoreVert from '$icons/MoreVert.svelte';
	import Play from '$icons/PlayArrow.svelte';
	import Pause from '$icons/Pause.svelte';
	import {
		selectedAlbum,
		playingAlbum,
		player,
		playingSong,
		posterSwiper,
		albumSwiper,
		playingIndex,
		valueTimeSplitBlock,
		remotePlaylistPlaying,
		playingSongList,
		shuffleSongs,
		discoverScreen,
		playlistControlsSwiper,
		playlistControls
	} from '$/stores';

	export let song;
	export let index;
	export let album;

	let expandMenu = false;

	async function playSong() {
		$remotePlaylistPlaying = false;
		$valueTimeSplitBlock = [];
		if ($playingAlbum.id !== $selectedAlbum.id) {
			$playingSongList = clone(album.songs);
			$shuffleSongs = false;
		}

		$playingAlbum = $selectedAlbum;
		$playingAlbum.title = $playingAlbum.title;
		$playingAlbum.author = $playingAlbum.author;
		$playingIndex = null;

		if ($playingIndex !== index) {
			loadSong(song);
			$playingSong = song;
			$playingIndex = index;
		}

		$player.play();

		$player.paused = $player.paused;
		openPoster();
	}

	async function togglePlay() {
		if ($player.paused) {
			$player.play();
		} else {
			$player.pause();
		}

		$player.paused = $player.paused;
	}

	function openPoster() {
		if (index === $playingIndex && JSON.stringify($playingSong) === JSON.stringify(song)) {
			document.getElementById('poster-swiper').style.visibility = 'initial';
			$posterSwiper.slideTo(1);
		}
	}

	function handleShowPlaylistControls(type) {
		expandMenu = false;

		document.getElementById('playlist-controls-swiper').style.visibility = 'initial';
		$playlistControlsSwiper.slideTo(1);

		$playlistControls = { type, song: { ...song, album: $selectedAlbum } };
	}
</script>

<li
	on:click={openPoster}
	class:active={index === $playingIndex && JSON.stringify($playingSong) === JSON.stringify(song)}
>
	{#if index === $playingIndex && JSON.stringify($playingSong) === JSON.stringify(song)}
		<button on:click|stopPropagation={togglePlay}>
			{#if $player && !$player.paused}
				<Pause size="32" />
			{:else}
				<Play size="32" />
			{/if}
		</button>
	{:else}
		<button on:click={playSong}><Play size="32" /></button>
	{/if}

	<p>{song.title}</p>
	<menu-container>
		<button on:click|stopPropagation|capture={() => (expandMenu = !expandMenu)}>
			<MoreVert size="24" />
		</button>
		{#if expandMenu}
			<menu>
				<ul transition:slide|global>
					<li on:click|stopPropagation={handleShowPlaylistControls.bind(this, 'add')}>
						Add to Playlist
					</li>
				</ul>
			</menu>
		{/if}
	</menu-container>
</li>

{#if expandMenu}
	<closer
		on:click={() => {
			expandMenu = false;
		}}
	/>
{/if}

<style>
	li {
		display: flex;
		list-style: none;
		justify-content: space-between;
		border-bottom: 1px solid var(--color-text-2);
		padding: 8px;
		align-items: center;
		cursor: default;
		user-select: none;
	}
	.active {
		cursor: pointer;
	}
	p {
		text-align: left;
		width: 100%;
		padding: 0;
		margin: 0 0 0 8px;
	}

	button {
		background-color: transparent;
		color: var(--color-text-0);
		min-width: 48px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	menu-container {
		position: relative;
	}

	menu {
		position: absolute;
		right: 0;
		padding: 0;
		margin: 0;
		z-index: 3;
	}

	menu ul {
		width: 120px;
		padding: 0;
		margin: 0;
		background-color: var(--color-bg-context-menu-0);
		background-image: linear-gradient(
			180deg,
			var(--color-bg-context-menu-0) 15%,
			var(--color-bg-context-menu-1) 66%
		);
		box-shadow: 0px 1px 10px 3px rgba(0, 0, 0, 0.75);
	}

	menu ul li {
		display: flex;
		list-style: none;
		justify-content: space-between;
		border-bottom: none;
		padding: 8px;
		border-top: 1px solid rgba(0, 0, 0, 0.25);
	}

	menu ul li:first-of-type {
		border-top: none;
	}

	menu ul li:hover {
		background-color: rgba(0, 0, 0, 0.25);
	}

	closer {
		display: block;
		position: absolute;
		height: 100%;
		width: 100%;
		top: 0;
		left: 0;
	}
</style>
