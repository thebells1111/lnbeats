<script>
	import { slide } from 'svelte/transition';
	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';
	import Modals from '$c/Modals/Modals.svelte';
	import MoreVert from '$icons/MoreVert.svelte';
	import Play from '$icons/PlayArrow.svelte';
	import Pause from '$icons/Pause.svelte';
	import AddSongToPlaylist from '$c/CreatePlaylist/AddSongToPlaylist.svelte';
	import RemoveConfirmModal from '$routes/library/RemoveConfirmModal.svelte';

	import { onMount } from 'svelte';
	import {
		posterSwiper,
		top100,
		top100Playing,
		player,
		remoteServer,
		playingAlbum,
		playingIndex,
		playingSong
	} from '$/stores';

	let expandMenu = false;
	let expandedIndex;
	let showModal = false;
	let modalType;

	const parserOptions = {
		attributeNamePrefix: '@_',
		//attrNodeName: false,
		//textNodeName : "#text",
		ignoreAttributes: false,
		ignoreNameSpace: false,
		attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
		tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
	};

	onMount(getTop);

	async function getTop() {
		if (!$top100.length) {
			let res = await fetch('https://stats.podcastindex.org/v4vmusic.html');
			let data = await res.text();

			let parser = new DOMParser();
			let doc = parser.parseFromString(data, 'text/html');

			let listItems = doc.querySelectorAll('.chart li');
			let dataArray = [];

			listItems.forEach((li, i) => {
				let rank = i + 1;
				let title = li.querySelector('.title').textContent;
				let href = li.querySelector('.title').getAttribute('href');
				let podcastIndexId = href.split('/').pop();
				let sats = parseInt(
					li.querySelector('.sats').textContent.replace(',', '').replace('sats', '').trim()
				);
				let artist = li.querySelector('.artist').textContent.replace('by ', '');
				let imageURL = li.querySelector('.cover').src;

				dataArray.push({
					rank: parseInt(rank),
					title,
					podcastIndexId,
					sats,
					artist,
					imageURL
				});
			});

			$top100 = dataArray.sort((a, b) => a.rank - b.rank);

			console.log($top100);
		}
	}

	async function playSong(song) {
		$top100Playing = true;
		console.log(song);
		console.log($top100Playing);
		const { podcastIndexId, rank, title } = song;
		if ($playingIndex === rank) {
			openPoster();
			return;
		}
		const feedUrl =
			remoteServer +
			`api/queryindex?q=${encodeURIComponent(`/podcasts/byfeedid?id=${podcastIndexId}`)}`;

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
				}

				albumData.feed.songs = [].concat(feed.item);
				albumData.feed.live = data.liveItem ? [].concat(data.liveItem) : undefined;
			}

			$playingAlbum = albumData.feed;
			$playingAlbum.title = $playingAlbum.title;
			$playingAlbum.author = $playingAlbum.author;

			const foundSong = $playingAlbum.songs.find((v) => {
				return v.title == title;
			});

			$player.pause();
			$player.src = foundSong.enclosure['@_url'];
			$playingSong = foundSong;
			$playingIndex = rank;

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

	function handleShowModal(type) {
		expandMenu = false;
		showModal = true;
		modalType = type;
	}
</script>

<ol>
	{#each $top100 as song}
		<!-- <li on:click={playSong.bind(this, song)}>
			<img width="60" src={song.imageURL} />
			{song.title}
		</li> -->

		<li on:click={playSong.bind(this, song)}>
			<p class="rank">#{song.rank}</p>

			<img width="60" src={song.imageURL} />
			{#if $player && !$player.paused && song.rank === $playingIndex && $top100Playing}
				<Pause size="48" />
			{:else}
				<Play size="48" />
			{/if}
			<p>{song.title}</p>
			<!-- <menu-container>
				<button on:click|stopPropagation|capture={() => (expandMenu = song.rank)}>
					<MoreVert size="24" />
				</button>
				{#if expandMenu === song.rank}
					<menu>
						<ul transition:slide>
							<li on:click|stopPropagation={handleShowModal.bind(this, 'playlist-add')}>
								Add to Playlist
							</li>
						</ul>
					</menu>
				{/if}
			</menu-container> -->
		</li>
	{/each}
</ol>

{#if expandMenu !== false}
	<closer
		on:click={() => {
			expandMenu = false;
		}}
	/>
{/if}

<!-- <Modals bind:showModal>
	{#if modalType === 'playlist-add'}
		<AddSongToPlaylist song={{ ...song, album: $selectedAlbum }} />
	
	{/if}
</Modals> -->
<style>
	ol {
		padding: 0;
		margin: 0;
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

	p.rank {
		width: 40px;
		margin: 0 8px 0 0;
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
		position: fixed;
		height: 100vh;
		width: 100vw;
		top: 0;
		left: 0;
		z-index: 2;
	}
</style>
