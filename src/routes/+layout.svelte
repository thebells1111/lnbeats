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
		$playingAlbum = (await albumDB.getItem('1529389')) || {};
		$playingSong = $playingAlbum.songs[0];
		$player.src = $playingSong.enclosureUrl;
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

	<footer>
		<NavFooter />
	</footer>

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
</app>

<style>
	app {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
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

	.poster-container {
		background-color: white;
		height: 100vh;
	}

	footer {
		height: 50px;
		background-color: var(--color-nav-bg-0);
	}

	main {
		flex-grow: 1;
		overflow: scroll;
	}
</style>
