<script>
	import { decode } from 'html-entities';

	import playNextSong from '$functions/player/playNextSong';
	import playPreviousSong from '$functions/player/playPreviousSong';
	import updatePlayerTime from '$functions/player/updatePlayerTime';
	import handleAutoBoost from '$functions/player/handleAutoBoost';

	import {
		player,
		playingSong,
		playingAlbum,
		playingChapters,
		currentPlayingChapter,
		currentChapterIndex,
		chapterBoostBypass,
		mediaSession
	} from '$/stores';

	import { onMount } from 'svelte';

	let isVideo = false;

	$: {
		isVideo = $playingSong?.enclosure?.['@_url']?.includes(".m3u8") || $playingSong?.enclosure?.['@_type']?.includes("video/");
	};

	function setupPlayer() {
		$player.ontimeupdate = () => {
			updatePlayerTime($player.currentTime);
			$player.currentTime = $player.currentTime;
		};

		$player.onloadedmetadata = () => {
			$player.duration = $player.duration;
			if ($mediaSession) {
				$mediaSession.metadata = new MediaMetadata({
					title: $playingSong.title,
					artist: $playingAlbum.author,
					artwork: [
						{
							src:
								$currentPlayingChapter?.img ||
								$playingSong.image ||
								$playingSong.artwork ||
								$playingSong?.['itunes:image']?.['@_href'] ||
								$playingAlbum.image ||
								$playingAlbum.artwork ||
								$playingAlbum?.['itunes:image']?.['@_href'] ||
								'./lnbeats_logo_black_circle_512.png',
							sizes: '512x512',
							type: 'image/png'
						}
					]
				});
			}
		};
		$player.onended = async () => {
			handleAutoBoost(
				$playingSong?.['podcast:value']?.['podcast:valueRecipient'] ||
					$playingAlbum?.['podcast:value']?.['podcast:valueRecipient']
			);
			playNextSong();
		};
		$mediaSession = navigator.mediaSession;
		setHandlers();
	}

	onMount(setupPlayer);

	function setHandlers() {
		const actionHandlers = [
			[
				'play',
				() => {
					$player.play();
					$mediaSession.playbackState = 'playing';
					console.log('play');
				}
			],
			[
				'pause',
				() => {
					$player.pause();
					$mediaSession.playbackState = 'paused';
					console.log('pause');
				}
			],
			['previoustrack', mediaGotoPreviousSong],
			['nexttrack', mediaGotoNextSong],
			[
				'stop',
				() => {
					/* ... */
				}
			],
			[
				'seekbackward',
				(details) => {
					$player.currentTime = Math.max($player.currentTime - 10, 0);
				}
			],
			[
				'seekforward',
				(details) => {
					print(details);
					$player.currentTime = Math.min($player.currentTime + 30, $player.duration);
				}
			],
			[
				'seekto',
				(details) => {
					print(details);
				}
			]
		];

		for (const [action, handler] of actionHandlers) {
			try {
				$mediaSession.setActionHandler(action, handler);
			} catch (error) {
				print(`The media session action "${action}" is not supported yet.`);
			}
		}
	}

	async function mediaGotoNextSong() {
		if ($currentChapterIndex < $playingChapters?.length - 1) {
			$currentChapterIndex++;
			$currentPlayingChapter = $playingChapters[$currentChapterIndex];
			$player.currentTime = $currentPlayingChapter.startTime;
			$chapterBoostBypass = true;
		} else {
			playNextSong();
		}
	}

	async function mediaGotoPreviousSong() {
		if ($currentChapterIndex > 0) {
			$currentChapterIndex--;
			$currentPlayingChapter = $playingChapters[$currentChapterIndex];
			$player.currentTime = $currentPlayingChapter.startTime;
			$chapterBoostBypass = true;
		} else {
			playPreviousSong();
		}
	}
</script>

<svelte:head>
	{#if $playingSong.title}
		<title
			>Playing:
			{$playingSong.title} -
			{$playingAlbum.author}</title
		>
	{/if}
</svelte:head>

<video
	disableRemotePlayback
	playsinline
	preload="metadata"
	bind:this={$player}
	controls={isVideo}
	poster={
		$currentPlayingChapter?.img ||
		$playingSong.image ||
		$playingSong.artwork ||
		$playingSong?.['itunes:image']?.['@_href'] ||
		$playingAlbum.image ||
		$playingAlbum.artwork ||
		$playingAlbum?.['itunes:image']?.['@_href']
	}
/>

<style>

video {
	width: calc(100% - 16px);
	max-width: 360px;
}

video[controls] {
	/* video content */
	max-width: none;
}

</style>
