<script>
	import clone from 'just-clone';
	import {
		playingSong,
		playingAlbum,
		posterSwiper,
		playingSongList,
		selectedAlbum,
		playingIndex,
		shuffleSongs,
		remotePlaylistPlaying,
		top100,
		loopSongs,
		player,
		playingChapters,
		currentPlayingChapter,
		currentChapterIndex,
		chapterBoostBypass
	} from '$/stores';

	import Shuffle from '$icons/Shuffle.svelte';
	import Laps from '$icons/Laps.svelte';
	import Play from '$icons/PlayArrow.svelte';
	import Pause from '$icons/Pause.svelte';
	import SkipNext from '$icons/SkipNext.svelte';
	import VolumeControls from './VolumeControls.svelte';
	import playNextSong from '$functions/player/playNextSong';

	import { page } from '$app/stores';

	function openPoster() {
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
		// setTimeout(() => $posterSwiper.slideTo(1), 1000);
	}

	function handlePlayPause(event) {
		event.stopPropagation(); // Prevent opening the poster
		if ($player && $player.paused) {
			$player.play();
		} else if ($player && $player.src) {
			$player.pause();
		}
		$player.paused = $player.paused;
	}

	async function gotoNextSong() {
		if ($currentChapterIndex < $playingChapters?.length - 1) {
			$currentChapterIndex++;
			$currentPlayingChapter = $playingChapters[$currentChapterIndex];
			while ($currentPlayingChapter.hasOwnProperty('toc') && $currentPlayingChapter.toc !== true) {
				if ($currentChapterIndex < $playingChapters?.length - 1) {
					$currentChapterIndex++;
					$currentPlayingChapter = $playingChapters[$currentChapterIndex];
				}
			}

			console.log($currentPlayingChapter);
			$player.currentTime = $currentPlayingChapter.startTime;
			$chapterBoostBypass = true;
		} else {
			await playNextSong();
		}
	}

	function handleShuffle() {
		$shuffleSongs = !$shuffleSongs;
		let newList;
		if ($remotePlaylistPlaying) {
			newList = $shuffleSongs ? shuffleArray(clone($top100)) : $top100;
		} else {
			newList = $shuffleSongs ? shuffleArray(clone($selectedAlbum.songs)) : $selectedAlbum.songs;
		}

		let guid = $playingSong?.guid?.['#text'] || $playingSong?.guid;
		$playingIndex = newList.findIndex((v) => {
			return guid === (v.guid?.['#text'] || v?.guid);
		});

		//move playing song to top of list if shuffling
		if ($shuffleSongs) {
			const _playingSong = newList.splice($playingIndex, 1)[0];
			newList.unshift(_playingSong);
			$playingIndex = 0;
		}

		$playingSongList = newList;

		function shuffleArray(array) {
			let currentIndex = array.length,
				randomIndex;

			// While there remain elements to shuffle...
			while (currentIndex !== 0) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;

				// And swap it with the current element.
				[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
			}

			return array;
		}
	}

	function handleLoop() {
		$loopSongs = !$loopSongs;
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

	<volume-controls>
		<VolumeControls size={120}/>
	</volume-controls>


	<button on:click|stopPropagation={handlePlayPause} class="play">
		{#if $player && $player.src}
			{#if $player.paused}
				<Play size="24" />
			{:else}
				<Pause size="24" />
			{/if}
		{:else}
			<Play size="24" />
		{/if}
	</button>

	<button on:click|stopPropagation={gotoNextSong} class="next">
		<SkipNext size="30" />
	</button>

	<button class:shuffled={$shuffleSongs} on:click|stopPropagation={handleShuffle} class="random">
		<Shuffle size="30" />
	</button>

	<button class:looped={$loopSongs} on:click|stopPropagation={handleLoop} class="loop">
		<Laps size="27" />
	</button>
</playbar>

<style>
	playbar {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--color-playbar-bg-0);
		width: 100%;
		height: 60px;
		min-height: 60px;
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

	volume-controls {
		position: absolute;
		right: 192px;
		gap: 4px;
	}

	button.play,
	button.next,
	button.random,
	button.loop {
		background-color: transparent;
		color: var(--color-text-0);
		min-width: 48px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		position: absolute;
		color: var(--color-text-0);
		right: 6px;
		background-color: gray;
		align-items: center;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		min-width: 36px;
		height: 36px;
		padding: 0;
		border-radius: 48px;
	}

	button.play {
		right: 144px;
	}

	button.next {
		right: 96px;
	}

	button.random {
		right: 48px;
	}

	button.shuffled {
		background-color: var(--color-theme-yellow-light);
	}

	button.looped {
		background-color: var(--color-theme-yellow-light);
	}

	@media (max-width: 480px) {
		volume-controls {
			display: none;
		}
	}

</style>
