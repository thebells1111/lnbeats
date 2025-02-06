<script>
	import { onMount } from 'svelte';
	import {
		playingAlbum,
		selectedAlbum,
		posterSwiper,
		valueTimeSplitBlock,
		discoverScreen,
		playingSongList
	} from '$/stores';
	import { decodeURL } from '$functions/songId';
	import loadSong from '$functions/loadSong';

	function isValidGuid(str) {
		const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		return regex.test(str);
	}

	export let data;
	let song;

	if (isValidGuid(data.songId)) {
		song = data.album.songs.find((v) => v.guid['#text'] === data.songId);
		console.log(data.album.songs.find((v) => v.guid['#text'] === 'data.songId'));
	} else {
		const songURL = decodeURL(data.songId);
		song = data.album.songs.find((v) => v.enclosure['@_url'] === songURL);
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
		history.replaceState({}, '', '/');
		$playingAlbum = data.album;
		$discoverScreen = 'nowPlaying';
		$selectedAlbum = data.album;
		$playingSongList = data.album.songs;
		if (song) {
			$valueTimeSplitBlock = [];
			loadSong(song);
			openPoster();
		}
	}

	onMount(initialSongLoad);
</script>

<svelte:head>
	{#if data.album && song}
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
