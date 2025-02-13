<script>
	import './styles.css';
	import 'swiper/css';
	import dbAlbums from './dbAlbums.json';
	import NavFooter from '$c/Nav/NavFooter/NavFooter.svelte';
	import Player from '$c/Player/Player.svelte';

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import localforage from 'localforage';
	import Discover from '$c/Discover/Discover.svelte';
	import Library from '$c/Library/Library.svelte';
	import SwiperContainer from '$c/Swipers/SwiperContainer.svelte';

	import {
		senderName,
		satsPerBoost,
		satsPerSong,
		user,
		webln,
		remoteServer,
		discoverList,
		featuredList,
		masterSongList,
		albumMap,
		artistList
	} from '$/stores';

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

	// Function to trigger PWA installation
	function installPWA() {
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
			let filteredFeeds = [];
			let _featuredList = [];

			dbAlbums.albums.forEach((v) => {
				if (v.generator.includes('Music Side Project')) {
					_featuredList = _featuredList.concat(v);
				} else if (v.generator.includes('Sovereign Feeds')) {
					_featuredList = _featuredList.concat(v);
				}
			});

			$featuredList = shuffleArray(_featuredList);

			const res = await fetch(
				remoteServer +
					`api/queryindex?q=${encodeURIComponent(
						'podcasts/bymedium?medium=music&val=lightning&max=10000'
					)}`
			);
			let data = await res.json();
			let fetchedFeeds = data.feeds || [data.feed] || [];
			console.log(fetchedFeeds);

			console.log(
				Array.from(new Map(dbAlbums.albums.map((album) => [album.podcastGuid, album]))).length
			);
			console.log(
				Array.from(new Map(fetchedFeeds.map((album) => [album.podcastGuid, album]))).length
			);

			fetchedFeeds = fetchedFeeds.filter((v) => v.lastUpdateTime >= dbAlbums.lastUpdateTime);

			console.log('updated feeds: ', fetchedFeeds);
			fetch('/get_songs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(fetchedFeeds)
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error(`Error: ${response.status}`);
					}
					return response.json(); // Return the JSON promise
				})
				.then((data) => {
					const songMap = new Map(
						$masterSongList.map((song) => [`${song.podcastGuid}-${song.guid}`, song])
					);

					(data || []).forEach((v) => {
						v.songs = v?.songs || v?.item;
						if (allowFeed(v)) {
							(v.songs || v.item || []).forEach((song) => {
								song.podcastGuid = v.podcastGuid;
								songMap.set(`${v.podcastGuid}-${song.guid}`, song);
							});
							$albumMap.set(v.podcastGuid, v);
						}
					});
					$discoverList = sortByPubDate(Array.from($albumMap.values()));
					$masterSongList = Array.from(songMap.values());
				})
				.catch((err) => {
					// Handles any error that happens
					console.log(err);
				});

			$albumMap = new Map(dbAlbums.albums.map((album) => [album.podcastGuid, album]));
			fetchedFeeds.forEach((v) => {
				$albumMap.set(v.podcastGuid, v);
			});

			let _discoverList = sortByPubDate(Array.from($albumMap.values()));

			const generators = new Set();

			function allowFeed(album) {
				if (
					//this removes 100% Retro Live Feed
					[5718023, 4222574, 424986].find((v) => album.id === v) ||
					album.author === 'Gabe Barrett' ||
					album.author === '小杉毅誉大'
				) {
					return false;
				}
				return true;
			}

			_discoverList.forEach((v) => {
				generators.add(v.generator);
				if (allowFeed(v)) {
					$masterSongList = $masterSongList.concat(
						(v.songs || v.item || []).map((w) => {
							w.podcastGuid = v.podcastGuid;
							return w;
						})
					);
					v.songs = v?.songs || v?.item;
					$artistList[v.author] = $artistList[v.author] || [];
					$artistList[v.author].push(v);
					filteredFeeds.push(v);
					if (v.generator.includes('Wavlake')) {
						wavlake.push(v);
					} else if (v.generator.includes('Music Side Project')) {
						msp.push(v);
					} else if (v.generator.includes('Sovereign Feeds')) {
						sf.push(v);
					} else if (v.generator.includes('RSS Blue')) {
						rssblue.push(v);
					} else {
						other.push(v);
					}
				}
			});

			console.log($artistList);

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
			$discoverList = filteredFeeds;
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
	<main class="apple-pad">
		<Discover />
		<Library />

		<slot />
	</main>

	<SwiperContainer />
	<Player />
	<NavFooter />

	<div class="header-background" />
	<div class="footer-background" />
	<div class="main-background" />
</app>

{#if !isPWA && showBanner}
	<div id="installBanner" class={bannerVisible ? 'slide-in' : 'slide-out'}>
		<input type="checkbox" bind:checked={dontShowAgain} /> Don't show me again
		<p>LNBeats works great as an app. Do you want to install?</p>
		<button on:click={installPWA}>Yes</button>
		<button on:click={hideBanner}>No</button>
	</div>
{/if}

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

	.share {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		align-self: flex-start;
		margin: 0 8px 0 0;
		font-weight: 700;
		color: var(--color-text-0);
		background-color: transparent;
		border: none;
		padding: 0;
		width: 36px;
		height: 36px;
	}
	.share p {
		font-size: 0.8em;
		padding: 4px 0 0 0;
		margin: 0;
		line-height: 0.8em;
		bottom: 0;
		color: var(--color-text-0);
	}
</style>
