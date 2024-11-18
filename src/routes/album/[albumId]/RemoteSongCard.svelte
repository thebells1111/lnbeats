<script>
	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';
	import Play from '$icons/PlayArrow.svelte';
	import Pause from '$icons/Pause.svelte';
	import { onMount, onDestroy } from 'svelte';

	import {
		selectedAlbum,
		posterSwiper,
		top100Playing,
		player,
		remoteServer,
		playingAlbum,
		playingIndex,
		playingSong,
		valueTimeSplitBlock,
		playFeatured,
		lnbRadioPlaying,
		remotePlaylistPlaying,
		remotePlaylist
	} from '$/stores';

	export let remoteSong;
	export let index;

	let root;
	let songInfo = {};
	let loaded = false;

	const parserOptions = {
		attributeNamePrefix: '@_',
		//attrNodeName: false,
		//textNodeName : "#text",
		ignoreAttributes: false,
		ignoreNameSpace: false,
		attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
		tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
	};

	let observer = null;
	onMount(async () => {
		observer = initialIntersectionObserver();
		observer.observe(root);

		if ($playFeatured && index === 0) {
			playSong();
			$playFeatured = false;
		}
	});

	onDestroy(() => {
		observer?.disconnect();
	});

	function initialIntersectionObserver() {
		return new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					loadRemoteInfo(); // load info if within the viewport
					observer.disconnect();
				}
			});
		});
	}

	async function loadRemoteInfo() {
		if (!remoteSong['@_feedGuid']) {
			return;
		}

		let remoteInfo = await fetchRemoteItem(remoteSong['@_feedGuid'], remoteSong['@_itemGuid']);

		if (!remoteInfo.episode || remoteInfo.episode.length === 0) {
			let feedInfo = await fetchRemoteFeed(remoteSong['@_feedGuid']);

			remoteInfo = {
				episode: {
					title: 'Unknown',
					feedTitle: feedInfo.feed.title,
					image: feedInfo.feed.image,
					podcastGuid: feedInfo.feed.podcastGuid
				}
			};
		}

		songInfo = remoteInfo.episode || {};
		loaded = true;
	}

	async function fetchRemoteItem(feedGuid, itemGuid) {
		const itemsUrl =
			remoteServer +
			`api/queryindex?q=${encodeURIComponent(
				`episodes/byguid?podcastguid=${feedGuid}&guid=${itemGuid}`
			)}`;
		const res = await fetch(itemsUrl);
		return await res.json();
	}

	async function fetchRemoteFeed(feedGuid) {
		const itemsUrl =
			remoteServer + `api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${feedGuid}`)}`;
		const res = await fetch(itemsUrl);
		return await res.json();
	}

	async function playSong() {
		$top100Playing = false;
		$lnbRadioPlaying = false;
		$valueTimeSplitBlock = [];

		const { podcastGuid, title } = songInfo;

		if ($playingIndex === index) {
			openPoster();
			return;
		}

		const feedUrl =
			remoteServer +
			`api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${podcastGuid}`)}`;

		try {
			const albumRes = await fetch(feedUrl);
			let albumData = await albumRes.json();
			if (!albumData.status) {
				throw error(404, 'Not found');
			}

			console.log(albumData.feed.url);
			const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
			let data = await res.text();

			let xml2Json = parse(data, parserOptions);
			let feed = xml2Json.rss.channel;

			console.log(feed);

			if (feed) {
				if (feed.item?.[0]?.['podcast:episode']) {
					feed.item.sort((a, b) => (a['podcast:episode'] > b['podcast:episode'] ? 1 : -1));
				} else if (feed.item?.[0]?.['itunes:episode']) {
					feed.item.sort((a, b) => (a['itunes:episode'] > b['itunes:episode'] ? 1 : -1));
				}

				albumData.feed.songs = [].concat(feed.item);
				albumData.feed.live = data.liveItem ? [].concat(data.liveItem) : undefined;
			}

			$playingAlbum = albumData.feed;
			console.log($playingAlbum);
			$playingAlbum.title = $playingAlbum.title;
			$playingAlbum.author = $playingAlbum.author;

			const foundSong = $playingAlbum.songs.find((v) => {
				return v.guid['#text'] === remoteSong['@_itemGuid'];
			});

			$player.pause();
			$player.src = foundSong.enclosure['@_url'];
			$playingSong = foundSong;
			$playingIndex = index;

			$remotePlaylist = $selectedAlbum.remoteSongs;
			$remotePlaylistPlaying = true;

			$player.play();

			$player.paused = $player.paused;

			openPoster();
		} catch (err) {
			console.log(err);
		}
	}

	function openPoster() {
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
		// setTimeout(() => $posterSwiper.slideTo(1), 1000);
	}
</script>

<li bind:this={root} on:click={playSong}>
	{#if $player && !$player.paused && index === $playingIndex && $remotePlaylistPlaying}
		<Pause size="48" />
	{:else}
		<Play size="48" />
	{/if}

	{#if !loaded}
		<img width="60" src="" />
		Loading...
	{:else}
		<img width="60" src={songInfo.image || songInfo.feedImage} />

		<song-info>
			<p>{songInfo.title || remoteSong['@_itemGuid']}</p>
			<p>{songInfo.feedTitle || remoteSong['@_feedGuid']}</p>
		</song-info>
	{/if}
</li>

<style>
	song-info {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	song-info > p:nth-of-type(2) {
		padding-left: 12px;
		font-size: 0.9em;
		font-style: italic;
	}

	li {
		display: flex;
		list-style: none;
		justify-content: flex-start;
		border-bottom: 1px solid var(--color-text-2);
		padding: 8px;
		align-items: center;
	}

	p {
		text-align: left;
		width: 100%;
		padding: 0;
		margin: 0 0 0 12px;
	}

	img {
		margin-left: 8px;
	}
</style>
