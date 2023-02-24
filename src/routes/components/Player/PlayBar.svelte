<script>
	import { playingSong, playingAlbum, posterSwiper } from '$/stores';
	import PlayPauseButton from '$buttons/player/PlayPauseButton.svelte';
	import PreviousSong from '$buttons/player/PreviousSong.svelte';
	import NextSong from '$buttons/player/NextSong.svelte';
	import { page } from '$app/stores';

	function openPoster() {
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
		// setTimeout(() => $posterSwiper.slideTo(1), 1000);
	}
</script>

<playbar
	class:hide={!$playingSong?.enclosure?.['@_url'] || [`/poster`].find((r) => r === $page.route.id)}
	on:click={openPoster}
>
	<playbar-controls>
		<img
			src={$playingSong.image ||
				$playingSong.artwork ||
				$playingAlbum.image ||
				$playingAlbum.artwork}
		/>
		<song-info>
			<song-title>{$playingSong.title}</song-title>
			<album-title>{$playingAlbum.title}</album-title>
		</song-info>
	</playbar-controls>
</playbar>

<style>
	playbar {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--color-playbar-bg-0);
		width: 100%;
		height: 60px;
		cursor: pointer;
	}

	playbar-controls {
		width: 100%;
		max-width: 720px;
		display: flex;
		align-items: center;
		height: 100%;
	}

	.hide {
		display: none;
	}

	song-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		flex-grow: 1;
		height: calc(100% - 10px);
		margin: 6px 0 4px 0;
	}

	song-title {
		font-weight: 600;
		color: var(--color-text-0);
	}
	album-title {
		font-size: 0.9em;
		padding-left: 4px;

		color: var(--color-text-1);
	}

	img {
		width: 50px;
		height: 50px;
		border-radius: 4px;
		margin: 0 4px;
	}
</style>
