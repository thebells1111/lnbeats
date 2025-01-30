<script>
	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';
	import loadSong from '$functions/loadSong';
	import SkipPrevious from '$icons/SkipPrevious.svelte';
	import playPreviousSong from '$functions/player/playPreviousSong';
	import {
		playingIndex,
		playingChapters,
		currentPlayingChapter,
		currentChapterIndex,
		player,
		chapterBoostBypass,
		top100,
		remoteServer,
		favorites,
		favoritesDB,
		remotePlaylistPlaying,
		remotePlaylist,
		playingSongList
	} from '$/stores';

	const parserOptions = {
		attributeNamePrefix: '@_',
		//attrNodeName: false,
		//textNodeName : "#text",
		ignoreAttributes: false,
		ignoreNameSpace: false,
		attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
		tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
	};

	export let size = 30;
	export let style;

	import { playingAlbum, playingSong } from '$/stores';

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
