<script>
	import './styles.css';
	import 'swiper/css';
	import NavHeader from './main/NavHeader/NavHeader.svelte';
	import NavFooter from './main/NavFooter/NavFooter.svelte';
	import Player from '$c/Player/Player.svelte';
	import BoostScreen from '$c/BoostScreen/BoostScreen.svelte';
	import InstructionScreen from '$c/BoostScreen/InstructionScreen.svelte';
	import Album from '$c/Album/Album.svelte';

	import Close from '$icons/Close.svelte';

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import localforage from 'localforage';
	import { Swiper, SwiperSlide } from 'swiper/svelte';
	import Poster from './poster/Poster.svelte';
	import SmallModal from '$c/Modals/SmallModal.svelte';
	import AddSongToPlaylist from '$c/CreatePlaylist/AddSongToPlaylist.svelte';
	import Modals from '$c/Modals/Modals.svelte';
	import Share from '$c/Share/Share.svelte';
	import {
		posterSwiper,
		albumSwiper,
		senderName,
		satsPerBoost,
		satsPerSong,
		user,
		webln,
		showBoostScreen,
		showInstructionScreen,
		remoteServer,
		shareUrl,
		discoverList,
		featuredList,
		playingSong,
		playingAlbum,
		top100
	} from '$/stores';

	let albumList = [];
	let wavlake = [];
	let rssblue = [];
	let msp = [];
	let sf = [];
	let other = [];

	let isPWA = false;
	let showBanner = false;
	let deferredPrompt;
	let dontShowAgain = false;
	let bannerVisible = false;
	let showPlaylistModal = false;

	// Function to trigger PWA installation
	function installPWA() {
		// console.log(deferredPrompt);
		if (deferredPrompt) {
			deferredPrompt.prompt();
			deferredPrompt.userChoice.then((choiceResult) => {
				if (choiceResult.outcome === 'accepted') {
					isPWA = true;
				}
				deferredPrompt = null;
			});
		}
	}

	// Function to hide the banner
	function hideBanner() {
		bannerVisible = false;
		setTimeout(() => {
			showBanner = false;
			if (dontShowAgain) {
				localStorage.setItem('noShowBanner', 'true');
			}
		}, 300); // Wait for the slide-out transition to complete
	}

	onMount(async () => {
		getDiscoverList();
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/serviceworker.js');
		}

		// Check if PWA is already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			isPWA = true;
		}

		// Check if user has opted to not see the banner again

		// Capture the install prompt event
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			if (localStorage.getItem('noShowBanner') !== 'true') {
				showBanner = true;
			}
			if (!isPWA && showBanner) {
				bannerVisible = true;
			}
		});

		const resizeOps = () => {
			document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
		};

		resizeOps();
		window.addEventListener('resize', resizeOps);

		const albumDB = localforage.createInstance({
			name: 'albumDB'
		});
		const boostDB = localforage.createInstance({
			name: 'boostDB'
		});

		$senderName = await boostDB.getItem('senderName');
		$satsPerBoost = (await boostDB.getItem('satsPerBoost')) || $satsPerBoost || 1000;
		$satsPerSong = (await boostDB.getItem('satsPerSong')) || $satsPerSong || 0;

		await loadAlby();

		if (window?.webln) {
			// $user.preferences.wallet = 'webln';
			$webln = window.webln;
		}
		// $playingAlbum = (await albumDB.getItem('1529389')) || {};
		// $playingSong = $playingAlbum.songs[0];
		// $player.src = $playingSong.enclosure['@_url'];
	});

	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	async function loadAlby() {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');

		if (code) {
			const url = new URL(window.location.href);

			let res = await fetch(
				remoteServer +
					'api/alby/auth?code=' +
					code +
					'&redirect_uri=' +
					`${url.protocol}//${url.host}${url.pathname}`,
				{
					credentials: 'include'
				}
			);
			let data = await res.json();
			if (data.lightning_address) {
				$user.loggedIn = true;
				$user.name = data.lightning_address;
				$user.balance = data.balance;
			}
			const urlWithoutQuery = window.location.href.split('?')[0];
			window.history.replaceState(null, null, urlWithoutQuery);
		} else {
			let res = await fetch(remoteServer + 'api/alby/refresh', {
				credentials: 'include'
			});
			let data = await res.json();
			if (data.lightning_address) {
				$user.loggedIn = true;
				$user.name = data.lightning_address;
				$user.balance = data.balance;
			}
		}
	}

	async function getDiscoverList() {
		if (!$discoverList.length) {
			const res = await fetch(
				remoteServer +
					`api/queryindex?q=${encodeURIComponent(
						'podcasts/bymedium?medium=music&val=lightning&max=10000'
					)}`
			);
			let data = await res.json();
			let fetchedFeeds = data.feeds || data.feed || [];
			let filteredFeeds = [];
			let _featuredList = [];

			const generators = new Set();

			fetchedFeeds.forEach((v) => {
				let addFeed = true;
				if (
					//this removes 100% Retro Live Feed
					[5718023].find((w) => v.id === w) ||
					v.author === 'Gabe Barrett'
				) {
					addFeed = false;
				}
				generators.add(v.generator);
				if (addFeed) {
					filteredFeeds.push(v);
					if (v.generator.includes('Wavlake')) {
						wavlake.push(v);
					} else if (v.generator.includes('Music Side Project')) {
						_featuredList = _featuredList.concat(v);
						msp.push(v);
					} else if (v.generator.includes('Sovereign Feeds')) {
						_featuredList = _featuredList.concat(v);
						sf.push(v);
					} else if (v.generator.includes('RSS Blue')) {
						rssblue.push(v);
					} else {
						other.push(v);
					}
				}
			});

			// console.log(generators);

			albumList = sortByPubDate(filteredFeeds);
			_featuredList = shuffleArray(_featuredList);
			addToFeaturedList(_featuredList);
			setTimeout(addToFeaturedList, 1000);

			function addToFeaturedList() {
				const newItems = _featuredList.splice(0, 20);
				$featuredList = $featuredList.concat(newItems);
				if (_featuredList.length > 0) {
					setTimeout(addToFeaturedList, 1000);
				}
			}

			$discoverList = albumList;

			wavlake.sort((a, b) => {
				return a.title.localeCompare(b.title); // Sort by author
			});

			other.sort((a, b) => {
				return a.title.localeCompare(b.title); // Sort by author
			});

			console.log('Music Side Project Feeds: ', msp);
			console.log('Sovereign Feeds', sf);
			console.log('Wavlake Feeds: ', wavlake);
			console.log('RSS Blue Feeds', rssblue);
			console.log('Other Feeds: ', other);
		}
	}

	function sortByPubDate(arr) {
		arr.sort((a, b) => (a.newestItemPubdate < b.newestItemPubdate ? 1 : -1));

		return arr;
	}
</script>

<svelte:head>
	{#if ['/album/[albumId]', '/album/[albumId]/[songId]'].findIndex((v) => v === $page.route.id) === -1}
		<!-- Primary Meta Tags -->
		<title>LN Beats</title>
		<meta name="title" content="LN Beats" />
		<meta
			name="description"
			content="Lightning Network Enabled, Decentralized Music For The Masses"
		/>

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website" />
		<meta property="og:url" content="https://lnbeats.com/" />
		<meta property="og:title" content="LN Beats" />
		<meta
			property="og:description"
			content="Lightning Network Enabled, Decentralized Music For The Masses"
		/>
		<meta property="og:image" content="https://lnbeats.com/twitter-card.png" />

		<!-- Twitter -->
		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:url" content="https://lnbeats.com/" />
		<meta property="twitter:title" content="LN Beats" />
		<meta
			property="twitter:description"
			content="Lightning Network Enabled, Decentralized Music For The Masses"
		/>
		<meta property="twitter:image" content="https://lnbeats.com/twitter-card.png" />
	{/if}
</svelte:head>

<app>
	{#if ![`/`, `/poster`, '/discover'].find((r) => r === $page.route.id)}
		<NavHeader />
	{/if}

	<main
		class:apple-pad={[`/`, `/poster`, '/discover', '/library'].find((r) => r === $page.route.id)}
	>
		<slot />
	</main>

	<Player />

	<NavFooter />

	<poster id="poster-swiper">
		<Swiper
			direction="vertical"
			autoHeight={true}
			simulateTouch={false}
			on:slideChange={() => {
				// document.getElementById('poster-swiper').style.display = 'none';

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
			<SwiperSlide>
				<Poster bind:showPlaylistModal />
			</SwiperSlide>
		</Swiper>
	</poster>
	<album id="album-swiper">
		<Swiper
			direction="vertical"
			autoHeight={true}
			simulateTouch={false}
			on:slideChange={() => {
				// document.getElementById('poster-swiper').style.display = 'none';

				if ($albumSwiper.activeIndex === 0) {
					setTimeout(
						() => (document.getElementById('album-swiper').style.visibility = 'hidden'),
						500
					);
				}
			}}
			on:swiper={(e) => ($albumSwiper = e.detail[0])}
		>
			<SwiperSlide><div class="hidden-slide" /></SwiperSlide>
			<SwiperSlide>
				<album-container>
					<button
						on:click={() => {
							$albumSwiper.slideTo(0);
							setTimeout(() => {
								document.getElementById('album-swiper').style.visibility = 'hidden';
							}, 500);
						}}
					>
						<Close size={24} />
					</button>
					<Album album={$top100} />
				</album-container>
			</SwiperSlide>
		</Swiper>
	</album>
	<div class="header-background" />
	<div class="footer-background" />
	<div class="main-background" />
</app>

{#if $shareUrl}
	<SmallModal bind:showModal={$shareUrl}>
		<Share />
	</SmallModal>
{/if}

{#if $showBoostScreen}
	<BoostScreen />
{:else if $showInstructionScreen}
	<InstructionScreen />
{/if}

{#if !isPWA && showBanner}
	<div id="installBanner" class={bannerVisible ? 'slide-in' : 'slide-out'}>
		<input type="checkbox" bind:checked={dontShowAgain} /> Don't show me again
		<p>LNBeats works great as an app. Do you want to install?</p>
		<button on:click={installPWA}>Yes</button>
		<button on:click={hideBanner}>No</button>
	</div>
{/if}

<Modals bind:showModal={showPlaylistModal}>
	<AddSongToPlaylist song={{ ...$playingSong, album: $playingAlbum }} />
</Modals>

<style>
	app {
		height: 100%;
		max-width: 720px;
		width: 100%;
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
		display: flex;
		flex-direction: column;
		padding: 0;
	}

	.apple-pad {
		padding-left: env(safe-area-inset-left);
		padding-right: env(safe-area-inset-right);
		padding-top: env(safe-area-inset-top);
	}

	poster,
	album {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		visibility: hidden;
		z-index: 98;
	}

	poster {
		z-index: 99;
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
		padding-top: env(safe-area-inset-top);
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
		padding-bottom: env(safe-area-inset-bottom);
	}

	.main-background {
		background-attachment: fixed;
		background-color: var(--color-bg-2);
		z-index: -2;
		position: absolute;
		height: 100%;
		width: 100%;
	}

	album-container {
		min-width: 100%;
		height: calc(100vh);
		height: calc(var(--vh, 1vh) * 100);
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;

		display: flex;
		flex-direction: column;
		padding: 16px 8px 8px 8px;

		background-color: var(--color-poster-bg-0);
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 33%,
			var(--color-poster-bg-1) 66%
		);
	}

	@media (min-width: 722px) {
		app {
			height: calc(100vh - 16px);
		}

		.header-background {
			border-radius: 8px 8px 0 0;
		}

		.footer-background {
			border-radius: 0 0 8px 8px;
		}
	}

	#installBanner {
		position: fixed;
		bottom: -150px; /* Initially hidden */
		left: 0;
		width: 100%;
		background-color: #333;
		color: white;
		text-align: center;
		transition: bottom 0.3s ease;
		padding-top: 8px;
	}

	#installBanner.slide-in {
		bottom: 0; /* Slide in */
	}

	#installBanner.slide-out {
		bottom: -150px; /* Slide out */
	}

	#installBanner button {
		background-color: var(--color-bg-button-0);
		padding: 8px;
		margin: 0 16px 8px 16px;
		width: 50px;
		border-radius: 16px;
		font-weight: bold;
	}

	#installBanner button:nth-of-type(2) {
		background-color: var(--color-bg-button-1);
		color: var(--color-text-0);
	}
</style>
