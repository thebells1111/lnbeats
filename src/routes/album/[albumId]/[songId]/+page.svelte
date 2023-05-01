<script>
	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';
	import Album from '../+page.svelte';
	import { onMount } from 'svelte';
	import { decodeURL } from '$functions/songId';

	///album/a94f5cc9-8c58-55fc-91fe-a324087a655b/aHR0cHM6Ly9tcDNzLnBvZGNhc3RpbmRleC5vcmcvMTMubXAz

	import { selectedAlbum, playingAlbum, player, playingSong, posterSwiper } from '$/stores';

	export let data = {};
	$selectedAlbum = data.album;
	let songURL;
	try {
		songURL = decodeURL(data.songId);
	} catch (error) {}

	function loadSong(song) {
		$playingAlbum = $selectedAlbum;
		$playingAlbum.title = $playingAlbum.title;
		$playingAlbum.author = $playingAlbum.author;

		if ($player.src !== song.enclosure['@_url']) {
			$player.pause();
			$player.src = song.enclosure['@_url'];
			$playingSong = song;
		}
	}

	function openPoster() {
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
		// setTimeout(() => $posterSwiper.slideTo(1), 1000);
	}

	function initialSongLoad() {
		if (songURL) {
			let i = $selectedAlbum.songs.findIndex((v) => v.enclosure['@_url'] === songURL);

			if (i > -1) {
				loadSong($selectedAlbum.songs[i]);
				setTimeout(openPoster, 500);
			}
		}
	}

	onMount(initialSongLoad);
</script>

<Album {data} />
