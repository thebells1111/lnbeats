<script>
	import './styles.css';
	import 'swiper/css';
	import NavHeader from './main/NavHeader/NavHeader.svelte';
	import NavFooter from './main/NavFooter/NavFooter.svelte';
	import Player from './components/Player/Player.svelte';
	import { playingSong, playingAlbum, player, posterSwiper } from '$/stores';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import localforage from 'localforage';
	import { Swiper, SwiperSlide } from 'swiper/svelte';
	import Poster from './poster/Poster.svelte';

	onMount(async () => {
		const albumDB = localforage.createInstance({
			name: 'albumDB'
		});
		// $playingAlbum = (await albumDB.getItem('1529389')) || {};
		// $playingSong = $playingAlbum.songs[0];
		// $player.src = $playingSong.enclosureUrl;
	});
</script>

<app>
	{#if ![`/`, `/poster`].find((r) => r === $page.route.id)}
		<NavHeader />
	{/if}

	<main>
		<slot />
	</main>

	<Player />

	<NavFooter />

	<poster id="poster-swiper">
		<Swiper
			direction="vertical"
			autoHeight={true}
			on:slideChange={() => {
				// document.getElementById('poster-swiper').style.display = 'none';
				console.log('slide change');
				console.log($posterSwiper.activeIndex);
				if ($posterSwiper.activeIndex === 0) {
					setTimeout(
						() => (document.getElementById('poster-swiper').style.visibility = 'hidden'),
						500
					);
				}
			}}
			on:swiper={(e) => ($posterSwiper = e.detail[0])}
		>
			<SwiperSlide><div class="hidden-slide" /></SwiperSlide>
			<SwiperSlide><Poster /></SwiperSlide>
		</Swiper>
	</poster>
	<div class="header-background" />
	<div class="footer-background" />
</app>

<style>
	app {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	main {
		max-width: 720px;
		width: 100%;
		overflow: auto;
		margin: 0 auto;
		flex-grow: 1;
	}

	poster {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		visibility: hidden;
	}

	.hidden-slide {
		background-color: transparent;
		height: 100vh;
	}

	.header-background {
		position: absolute;
		top: 0;
		height: 100px;
		width: 100%;
		background-color: var(--color-bg-2);
		background-image: linear-gradient(
			180deg,
			var(--color-bg-0) 0%,
			var(--color-bg-1) 40%,
			var(--color-bg-2) 100%
		);
		z-index: -1;
	}

	.footer-background {
		position: absolute;
		bottom: 0;
		height: 60px;
		width: 100%;
		background-color: var(--color-bg-2);
		background-image: linear-gradient(
			180deg,
			var(--color-bg-2) 0%,
			var(--color-bg-0) 10%,
			var(--color-bg-1) 100%
		);
		z-index: -1;
	}
</style>
