<script>
	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';
	import { slide } from 'svelte/transition';
	import MoreVert from '$icons/MoreVert.svelte';
	import Play from '$icons/PlayArrow.svelte';
	import Pause from '$icons/Pause.svelte';
	import { onMount, onDestroy } from 'svelte';
	import loadRemoteInfo from '$functions/loadRemoteInfo';

	import {
		posterSwiper,
		albumSwiper,
		playlistControlsSwiper,
		player,
		remoteServer,
		playingAlbum,
		playingIndex,
		playingSong,
		valueTimeSplitBlock,
		remotePlaylistPlaying,
		remotePlaylist,
		isPlaylist,
		playlistControls
	} from '$/stores';

	export let remoteSong;
	export let index;
	export let album;

	let root;
	let songInfo = {};
	let loaded = false;
	let expandMenu = false;

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
	});

	onDestroy(() => {
		observer?.disconnect();
	});

	function initialIntersectionObserver() {
		return new IntersectionObserver((entries) => {
			entries.forEach(async (entry) => {
				if (entry.isIntersecting) {
					songInfo = await loadRemoteInfo(remoteSong, songInfo); // load info if within the viewport
					loaded = true;
					observer.disconnect();
				}
			});
		});
	}

	async function playSong() {
		$valueTimeSplitBlock = [];

		const { podcastGuid } = songInfo;

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

			const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
			let data = await res.text();

			let xml2Json = parse(data, parserOptions);
			let feed = xml2Json.rss.channel;

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
			$playingAlbum.title = $playingAlbum.title;
			$playingAlbum.author = $playingAlbum.author;

			const foundSong = $playingAlbum.songs.find((v) => {
				return v.guid['#text'] === remoteSong['@_itemGuid'];
			});

			$player.pause();
			$player.src = foundSong.enclosure['@_url'];
			$playingSong = foundSong;
			$playingIndex = index;
			$remotePlaylist = album;
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
		setTimeout(() => {
			$albumSwiper.slideTo(0);
			setTimeout(() => {
				document.getElementById('album-swiper').style.visibility = 'hidden';
			}, 500);
		}, 500);
		// setTimeout(() => $posterSwiper.slideTo(1), 1000);
	}

	function handleShowPlaylistControls(type) {
		expandMenu = false;
		document.getElementById('playlist-controls-swiper').style.visibility = 'initial';
		$playlistControlsSwiper.slideTo(1);
		if (type === 'add') {
			$playlistControls = { type, song: { ...songInfo, album } };
		} else if (type === 'remove') {
			$playlistControls = {
				type,
				item: { songInfo },
				playlist: { album },
				itemType: 'playlist-song'
			};
		}
	}

	$: isSongPlaying =
		songInfo?.podcastGuid === $playingAlbum.podcastGuid &&
		songInfo?.guid === ($playingSong?.guid?.['#text'] || $playingSong?.guid) &&
		index === $playingIndex;
</script>

<li bind:this={root} on:click={playSong}>
	{#if $player && !$player.paused && $remotePlaylistPlaying && isSongPlaying}
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

		<menu-container>
			<button on:click|stopPropagation|capture={() => (expandMenu = !expandMenu)}>
				<MoreVert size="24" />
			</button>
			{#if expandMenu}
				<menu>
					<ul transition:slide|global>
						<li on:click|stopPropagation={handleShowPlaylistControls.bind(this, 'playlist-add')}>
							Add to Playlist
						</li>
						{#if $isPlaylist}
							<li on:click|stopPropagation={handleShowPlaylistControls.bind(this, 'remove')}>
								Remove
							</li>
						{/if}
					</ul>
				</menu>
			{/if}
		</menu-container>
	{/if}
</li>

{#if expandMenu}
	<closer
		on:click={() => {
			expandMenu = false;
		}}
	/>
{/if}

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
		justify-content: space-between;
		border-bottom: 1px solid var(--color-text-2);
		padding: 8px;
		align-items: center;
	}

	p {
		text-align: left;
		width: 100%;
		padding: 0;
		margin: 0 0 0 8px;
	}

	button {
		background-color: transparent;
		color: var(--color-text-0);
		min-width: 48px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	menu-container {
		position: relative;
	}

	menu {
		position: absolute;
		right: 0;
		padding: 0;
		margin: 0;
		z-index: 3;
	}

	menu ul {
		width: 120px;
		padding: 0;
		margin: 0;
		background-color: var(--color-bg-context-menu-0);
		background-image: linear-gradient(
			180deg,
			var(--color-bg-context-menu-0) 15%,
			var(--color-bg-context-menu-1) 66%
		);
		box-shadow: 0px 1px 10px 3px rgba(0, 0, 0, 0.75);
	}

	menu ul li {
		display: flex;
		list-style: none;
		justify-content: space-between;
		border-bottom: none;
		padding: 8px;
		border-top: 1px solid rgba(0, 0, 0, 0.25);
	}

	menu ul li:first-of-type {
		border-top: none;
	}

	menu ul li:hover {
		background-color: rgba(0, 0, 0, 0.25);
	}

	closer {
		display: block;
		position: absolute;
		height: 100%;
		width: 100%;
		top: 0;
		left: 0;
		z-index: 2;
	}
</style>
