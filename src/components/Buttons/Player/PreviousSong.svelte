<script>
	import { decode } from 'html-entities';
	import SkipPrevious from '$icons/SkipPrevious.svelte';
	import playPreviousSong from '$functions/player/playPreviousSong';
	import {
		playingChapters,
		currentPlayingChapter,
		currentChapterIndex,
		player,
		chapterBoostBypass
	} from '$/stores';

	export let size = 30;
	export let style;

	async function gotoPreviousSong() {
		if ($currentChapterIndex > 0) {
			$currentChapterIndex--;
			$currentPlayingChapter = $playingChapters[$currentChapterIndex];
			while ($currentPlayingChapter.hasOwnProperty('toc') && $currentPlayingChapter.toc !== true) {
				if ($currentChapterIndex > 0) {
					$currentChapterIndex--;
					$currentPlayingChapter = $playingChapters[$currentChapterIndex];
				}
			}
			$player.currentTime = $currentPlayingChapter.startTime;
			$chapterBoostBypass = true;
		} else {
			playPreviousSong();
		}
	}
</script>

<button on:click={gotoPreviousSong} aria-label="Previous Song" {style}>
	<SkipPrevious {size} />
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
