<script>
	import playNextSong from '$functions/player/playNextSong';
	import SkipNext from '$icons/SkipNext.svelte';
	export let size = 30;
	export let style;

	import {
		playingChapters,
		currentPlayingChapter,
		currentChapterIndex,
		player,
		chapterBoostBypass
	} from '$/stores';

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
</script>

<button on:click={gotoNextSong} aria-label="Next Song" {style}>
	<SkipNext {size} />
</button>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		padding: 0;
		margin: 0;
		background-color: transparent;
		width: 45px;
		height: 45px;
	}
</style>
