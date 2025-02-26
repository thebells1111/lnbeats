<script>
	export let song;
	import loadValueBlockPromise from '$functions/loadValueBlockPromise';
	import loadAlbum from '$functions/loadAlbum';
	import loadSong from '$functions/loadSong';
	import CryptoJS from 'crypto-js';

	import {
		albumSwiper,
		selectedAlbum,
		albumMap,
		posterSwiper,
		playingSong,
		playingAlbum,
		playingSongList,
		playingIndex
	} from '$/stores';
	let imageUrl = song.artwork || song.image;

	async function openAlbum() {
		document.getElementById('album-swiper').style.visibility = 'initial';
		$albumSwiper.slideTo(1);

		let _album = $albumMap.get(song.podcastGuid);
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
		$playingSong = song;
		$selectedAlbum = await loadAlbum(_album.id, _album);
		$playingSongList = $selectedAlbum.songs || $selectedAlbum.item;
		$playingIndex = $playingSongList.findIndex((v) => v.guid === song.guid);
		$playingAlbum = $selectedAlbum;
		loadValueBlockPromise($selectedAlbum);
		loadSong($playingSong);
	}
	function hashUrl(url) {
		const hash = CryptoJS.SHA1(url).toString(CryptoJS.enc.Hex);
		return `https://lnbeats.b-cdn.net/images/${hash}.webp`;
	}

	$: handleImage(song);

	function handleImage(song) {
		if (song.hasOwnProperty('imageHash')) {
			imageUrl = song.imageHash;
		} else {
			song.imageHash = hashUrl(
				song.artwork ||
					song.image ||
					$albumMap.get(song.podcastGuid).artwork ||
					$albumMap.get(song.podcastGuid).image
			);
			imageUrl = song.imageHash;
		}
	}

	function handleError(err) {
		song.imageHash = song.artwork || song.image;
		imageUrl = song.imageHash;
	}
</script>

{#if song}
	<button on:click={openAlbum}>
		<card>
			<img src={imageUrl} on:error={handleError} loading="lazy" width="115" height="115" />
			<song-title>{song.title}</song-title>
			<song-author>{song.author || ''}</song-author>
		</card>
	</button>
{/if}

<style>
	card {
		display: flex;
		flex-direction: column;
		width: 160px;
		height: 160px;
		max-width: calc(100% - 16px);
		margin-bottom: 8px;
		padding: 4px;
		backdrop-filter: blur(14px);
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 8px;
		color: var(--color-text-0);
	}

	img {
		width: 115px;
		border-radius: 4px;
		margin: 0 auto;
	}

	.gen-icon {
		width: 20px;
		height: 20px;
		position: absolute;
		right: 0px;
		background-color: black;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.gen-icon > img {
		width: 65%;
		border-radius: 0;
	}

	.msp {
		background-color: white;
	}

	.msp > img {
		width: 85%;
		border-radius: 0;
		position: relative;
		top: 1px;
	}

	.rss-blue {
		background-color: rgb(237, 244, 248);
	}

	.rss-blue > img {
		width: 50%;
		border-radius: 0;
		position: relative;
		bottom: 0px;
		left: 0px;
	}

	.sf > img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		position: relative;
	}

	song-title,
	song-author {
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		padding: 1px;
		font-size: 1.1em;
		font-weight: 550;
		display: flex;
		justify-content: flex-start;
	}

	song-title {
		margin-top: 4px;
	}

	song-author {
		padding-left: 6px;
		font-style: italic;
		font-size: 0.9em;
	}

	button {
		background-color: transparent;
	}
</style>
