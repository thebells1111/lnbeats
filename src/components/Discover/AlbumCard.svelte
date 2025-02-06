<script>
	export let album;
	export let fromSearch = false;
	import loadAlbum from '$functions/loadAlbum';
	import loadValueBlocks from '$functions/loadValueBlocks';
	import { onMount } from 'svelte';
	import CryptoJS from 'crypto-js';

	import { albumSwiper, selectedAlbum } from '$/stores';
	let imageUrl = album.artwork || album.image;

	async function openAlbum() {
		document.getElementById('album-swiper').style.visibility = 'initial';
		$albumSwiper.slideTo(1);
		$selectedAlbum = album;

		setTimeout(async () => {
			$selectedAlbum = await loadAlbum(album.podcastGuid, album);
			loadValueBlocks($selectedAlbum);

			console.log($selectedAlbum);
		}, 1);
	}
	function hashUrl(url) {
		const hash = CryptoJS.SHA1(url).toString(CryptoJS.enc.Hex);
		return `https://lnbeats.b-cdn.net/images/${hash}.webp`;
	}


	$:handleImage(album)

	function handleImage(album){
		if (album.hasOwnProperty('imageHash')) {
			imageUrl =  album.imageHash
		} else{
		album.imageHash = hashUrl(album.artwork || album.image);
		imageUrl = album.imageHash
		}		
	}

	function handleError() {		
		album.imageHash = album.artwork || album.image;
		imageUrl = album.imageHash
	}
</script>

{#if album}
	<button on:click={openAlbum}>
		<card>
			<img src={imageUrl} on:error={handleError} loading="lazy" width="115" height="115" />
			<album-title>{album.title}</album-title>
			<album-author>{album.author || ''}</album-author>

			{#if fromSearch}
				{#if album.generator.includes('Wavlake')}
					<div class="gen-icon">
						<img src="/wavlake-small.webp" />
					</div>
				{:else if album.generator.includes('Music Side Project')}
					<div class="gen-icon msp">
						<img src="/msp-icon-32.png" />
					</div>
				{:else if album.generator.includes('RSS Blue')}
					<div class="gen-icon rss-blue">
						<img src="/rssblue-small.webp" />
					</div>
				{:else if album.generator.includes('Sovereign Feeds')}
					<div class="gen-icon sf">
						<img src="/SF32.png" />
					</div>
				{/if}
			{/if}
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

	album-title,
	album-author {
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		padding: 1px;
		font-size: 1.1em;
		font-weight: 550;
		display: flex;
		justify-content: flex-start;
	}

	album-title {
		margin-top: 4px;
	}

	album-author {
		padding-left: 6px;
		font-style: italic;
		font-size: 0.9em;
	}

	button {
		background-color: transparent;
	}
</style>
