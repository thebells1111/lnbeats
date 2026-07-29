<script>
	import { onMount } from 'svelte';

	export let data;
	export let isSong = false;

	import { albumSwiper, selectedAlbum, playingAlbum, discoverScreen } from '$/stores';
	onMount(openAlbum);
	async function openAlbum() {
		history.replaceState({}, '', '/');
		$selectedAlbum = data;

		let startTime = Date.now();

		function trySlide() {
			if ($albumSwiper && typeof $albumSwiper.slideTo === 'function') {
				document.getElementById('album-swiper').style.visibility = 'visible';
				$albumSwiper.slideTo(1);
				setTimeout(() => {
					// $playingAlbum = data;
					// $discoverScreen = 'nowPlaying';
				}, 500);
			} else if (Date.now() - startTime < 30000) {
				setTimeout(trySlide, 100);
			}
		}

		trySlide();
	}
</script>

<svelte:head>
	{#if data && !isSong}
		<title>{`${data.author} - ${data.title}`}</title>
		<meta name="description" content={`${data.author} - ${data.title}`} />
		<meta property="og:site_name" content="LN Beats" />
		<meta property="og:title" content={`${data.author} - ${data.title}`} />
		<meta property="og:description" content="Listen on LN Beats" />
		<meta property="og:image" content={data.artwork || data.image} />
		<meta property="og:url" content={`https://lnbeats.com/album/${data.podcastGuid}`} />

		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:title" content={`${data.author} - ${data.title}`} />
		<meta property="twitter:description" content="Listen on LN Beats" />
		<meta property="twitter:image" content={data.artwork || data.image} />
		<meta property="twitter:url" content={`https://lnbeats.com/album/${data.podcastGuid}`} />
	{/if}
</svelte:head>
