<script>
	import gotoNextSong from '$functions/gotoNextSong';
	import { player, playingSong, playingAlbum, posterSwiper } from '$/stores';
	import PlayPauseButton from '$buttons/player/PlayPauseButton.svelte';
	import PlayBar from './PlayBar.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	function setupPlayer() {
		$player.ontimeupdate = () => {
			$player.currentTime = $player.currentTime;
		};
		$player.onloadedmetadata = () => {
			$player.duration = $player.duration;
		};
		$player.onended = () => {
			gotoNextSong();
		};
	}

	onMount(setupPlayer);

	function openPoster() {
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
		// setTimeout(() => $posterSwiper.slideTo(1), 1000);
	}
</script>

<audio playsinline preload="metadata" bind:this={$player} />

<PlayBar />

<style>
</style>
