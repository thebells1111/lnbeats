<script>
	import { requestProvider } from 'webln';
	import sendBoost from '$functions/sendBoost';
	import loadSong from '$functions/loadSong';
	import { player, playingSong, playingAlbum, posterSwiper, satsPerSong } from '$/stores';
	import PlayBar from './PlayBar.svelte';
	import { onMount } from 'svelte';

	function gotoNextSong() {
		let album = $playingAlbum;
		let currentSong = $playingSong;
		if (album?.songs && currentSong?.enclosure) {
			let songIndex = album.songs.findIndex(
				(song) => song.enclosure['@_url'] === currentSong.enclosure['@_url']
			);
			if (songIndex > -1 && songIndex < album.songs.length - 1) {
				loadSong(album.songs[songIndex + 1]);
			}
		}
	}

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
