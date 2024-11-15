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
	import Shuffle from '$icons/Shuffle.svelte';
	import Laps from '$icons/Laps.svelte';
	import { onMount } from 'svelte';
	import clone from 'just-clone';

	import {
		posterSwiper,
		top100,
		top100Playing,
		player,
		remoteServer,
		playingAlbum,
		playingIndex,
		playingSong,
		sortedTop100,
		top100Loop,
		valueTimeSplitBlock,
		remotePlaylistPlaying,
	} from '$/stores';

	let expandMenu = false;
	let expandedIndex;
	let showModal = false;
	let modalType;

	let isShuffled = false;

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
			let res = await fetch('https://stats.podcastindex.org/v4vmusic.json');
			let data = await res.json();

			console.log(data);

			let dataArray = data.items;

			$top100 = dataArray.sort((a, b) => a.rank - b.rank);
			$sortedTop100 = clone($top100);

			console.log($top100);
		}
	}

	async function playSong(song) {
		$top100Playing = true;
		$remotePlaylistPlaying = false;
		$valueTimeSplitBlock = [];
		console.log(song);
		console.log($top100Playing);

		const { feedGuid, rank, title } = song;

		if ($playingIndex === rank) {
			openPoster();
			return;
		}
		const feedUrl =
			remoteServer + `api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${feedGuid}`)}`;

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
				}

				albumData.feed.songs = [].concat(feed.item);
				albumData.feed.live = data.liveItem ? [].concat(data.liveItem) : undefined;
			}

			$playingAlbum = albumData.feed;
			console.log($playingAlbum);
			$playingAlbum.title = $playingAlbum.title;
			$playingAlbum.author = $playingAlbum.author;

			const foundSong = $playingAlbum.songs.find((v) => {
				return v.title.trim() == title.trim();
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

	function handleShuffle() {
		isShuffled = !isShuffled;
		$top100 = isShuffled ? shuffleArray([...$sortedTop100]) : $sortedTop100;

		function shuffleArray(array) {
			let currentIndex = array.length,
				randomIndex;

			// While there remain elements to shuffle...
			while (currentIndex !== 0) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;

				// And swap it with the current element.
				[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
			}

			return array;
		}
	}

	function handleLoop() {
		$top100Loop = !$top100Loop;
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

			<img width="60" src={song.image} />

			<song-info>
				<p>{song.title}</p>
				<p>{song.author}</p>
			</song-info>
			{#if $player && !$player.paused && song.rank === $playingIndex && $top100Playing}
				<Pause size="48" />
			{:else}
				<Play size="48" />
			{/if}
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

<button class:shuffled={isShuffled} on:click={handleShuffle} class="random">
	<Shuffle size="30" />
</button>

<button class:looped={$top100Loop} on:click={handleLoop} class="loop">
	<Laps size="27" />
</button>

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
	ol {
		padding: 0;
		margin: 0;
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

	button.random,
	button.loop {
		position: absolute;
		bottom: 75px;
		color: var(--color-text-0);
		right: 8px;
		background-color: gray;
		align-items: center;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		min-width: 36px;
		height: 36px;
		padding: 0;
		border-radius: 48px;
	}

	button.loop {
		bottom: 120px;
	}

	button.shuffled {
		background-color: var(--color-theme-yellow-light);
	}

	button.looped {
		background-color: var(--color-theme-yellow-light);
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
