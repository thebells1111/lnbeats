<script>
	import Album from '../+page.svelte';
	import { onMount } from 'svelte';
	import clone from 'just-clone';

	///album/a94f5cc9-8c58-55fc-91fe-a324087a655b/aHR0cHM6Ly9tcDNzLnBvZGNhc3RpbmRleC5vcmcvMTMubXAz

	import { playingAlbum, player, playingSong, posterSwiper } from '$/stores';
	import { decodeURL } from '$functions/songId';
	export let data;
	console.log(data.album);
	console.log(data.songId);

	const songURL = decodeURL(data.songId);
	const song = data.album.songs.find((v) => v.enclosure['@_url'] === songURL);
	console.log(song);

	function loadSong(song) {
		console.log(song);
		if ($player.src !== song.enclosure['@_url']) {
			$player.pause();
			$player.src = song.enclosure['@_url'];
			$playingSong = song;
		}
		openPoster();
	}

	function openPoster() {
		if ($posterSwiper) {
			document.getElementById('poster-swiper').style.visibility = 'initial';
			$posterSwiper.slideTo(1);
		} else {
			setTimeout(openPoster, 10);
		}
	}

	function initialSongLoad() {
		$playingAlbum = data.album;
		if (song) {
			loadSong(song);
		}
	}

	onMount(initialSongLoad);
</script>

<svelte:head>
	{#if data.album}
		<title>{`${data.album.author} - ${data.album.title} - ${song.title}`}</title>
		<meta
			name="description"
			content={`${data.album.author} - ${data.album.title} - ${song.title}`}
		/>
		<meta property="og:site_name" content="LN Beats" />
		<meta
			property="og:title"
			content={`${data.album.author} - ${data.album.title} - ${song.title}`}
		/>
		<meta property="og:description" content="Listen on LN Beats" />
		<meta
			property="og:image"
			content={song?.['itunes:image']?.['@_href'] || data.album.artwork || data.album.image}
		/>
		<meta
			property="og:url"
			content={`https://lnbeats.com/album/${data.album.podcastGuid}/${data.songId}`}
		/>

		<meta property="twitter:card" content="summary_large_image" />
		<meta
			property="twitter:title"
			content={`${data.album.author} - ${data.album.title} - ${song.title}`}
		/>
		<meta property="twitter:description" content="Listen on LN Beats" />
		<meta
			property="twitter:image"
			content={song?.['itunes:image']?.['@_href'] || data.album.artwork || data.album.image}
		/>
		<meta
			property="twitter:url"
			content={`https://lnbeats.com/album/${data.album.podcastGuid}/${data.songId}`}
		/>
	{/if}
</svelte:head>

{#if data}
	<Album {data} isSong={true} />
{/if}
