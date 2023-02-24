<script>
	import { requestProvider } from 'webln';
	import gotoNextSong from '$functions/gotoNextSong';
	import sendBoost from '$functions/sendBoost';
	import { player, playingSong, playingAlbum, posterSwiper, satsPerSong } from '$/stores';
	import PlayBar from './PlayBar.svelte';
	import { onMount } from 'svelte';

	function setupPlayer() {
		$player.ontimeupdate = () => {
			$player.currentTime = $player.currentTime;
		};
		$player.onloadedmetadata = () => {
			$player.duration = $player.duration;
		};
		$player.onended = async () => {
			gotoNextSong();
			if ($satsPerSong > 0) {
				try {
					webln = await requestProvider();
					sendBoost({
						webln: webln,
						destinations:
							$playingSong?.['@_value']?.destinations || $playingAlbum?.['@_value']?.destinations,
						satAmount: $satsPerSong
					});
				} catch (err) {
					// Tell the user what went wrong
					$satsPerSong = 0;
				}
			}
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
