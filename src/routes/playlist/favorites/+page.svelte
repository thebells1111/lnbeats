<script>
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Modals from '$c/Modals/Modals.svelte';
	import MoreVert from '$icons/MoreVert.svelte';
	import Play from '$icons/PlayArrow.svelte';
	import Pause from '$icons/Pause.svelte';
	import {
		favoritesDB,
		favorites,
		selectedPlaylist,
		selectedAlbum,
		playingAlbum,
		player,
		playingSong,
		posterSwiper,
		playingIndex,
		valueTimeSplitBlock,
		remoteServer,
		playingChapters,
		currentPlayingChapter,
		playingTranscript,
		playingTranscriptText,
		currentTranscriptIndex,
		remotePlaylistPlaying
	} from '$/stores';
	import AddSongToPlaylist from '$c/CreatePlaylist/AddSongToPlaylist.svelte';
	import RemoveConfirmModal from '$routes/library/RemoveConfirmModal.svelte';

	let song;
	export let index;

	let expandMenu = false;
	let showModal = false;
	let modalType;

	onMount(async () => {
		if (!Object.keys($favorites).length) {
			$favorites = (await favoritesDB.getItem('favoritesList')) || {};
			console.log($favorites);
		}
	});

	async function playSong(_song, index) {
		console.log(_song);
		song = await favoritesDB.getItem(_song.id);
		console.log(song);
		$remotePlaylistPlaying = false;
		if (song['podcast:chapters']) {
			fetch(remoteServer + `api/proxy?url=${encodeURIComponent(song['podcast:chapters']['@_url'])}`)
				.then((res) => res.json())
				.then((data) => ($playingChapters = data?.chapters))
				.then(() => console.log($playingChapters));
		} else {
			$playingChapters = undefined;
			$currentPlayingChapter = undefined;
		}

		if (
			song['podcast:transcript'] &&
			(song['podcast:transcript']['@_type'] === 'application/srt' ||
				song['podcast:transcript']['@_type'] === 'application/x-rip')
		) {
			fetch(
				remoteServer + `api/proxy?url=${encodeURIComponent(song['podcast:transcript']['@_url'])}`
			)
				.then((res) => (res.ok ? res.text() : ''))
				.then((data) => ($playingTranscriptText = data))
				.then(() => console.log($playingTranscriptText));
		} else {
			$playingTranscript = [];
			$playingTranscriptText = '';
			$currentTranscriptIndex = undefined;
		}

		$playingAlbum = {
			album: song.album,
			favorites: _song.id,
			title: song.album.title,
			artwork: song.album.artwork || song.album.image,
			songs: song,
			author: song.album.author,
			podcastGuid: song.album.podcastGuid
		};
		console.log(song);
		console.log($playingAlbum);

		if ($playingIndex !== index) {
			$player.pause();
			$player.src = song.enclosure['@_url'];
			$playingSong = song;
			$playingIndex = index;
		}

		const splits = song?.['podcast:value']?.['podcast:valueTimeSplit'] || [];

		if (splits.length > 0) {
			handleSplit(splits[0]).then((splitInfo) => {
				$valueTimeSplitBlock[0] = splitInfo;
			});
		}

		$player.play();

		$player.paused = $player.paused;
		openPoster();
		for (let i = 1; i < splits.length; i++) {
			let split = splits[i];
			$valueTimeSplitBlock[i] = await handleSplit(split);
		}

		async function handleSplit(split) {
			if (split['podcast:remoteItem']) {
				const feedGuid = split['podcast:remoteItem']?.['@_feedGuid'];
				const itemGuid = split['podcast:remoteItem']?.['@_itemGuid'];
				const startTime = split?.['@_startTime'];
				const duration = split?.['@_duration'];
				const remotePercentage = split?.['@_remotePercentage'];
				const feedGuidUrl =
					remoteServer +
					`api/queryindex?q=${encodeURIComponent(`/podcasts/byguid?guid=${feedGuid}`)}`;
				const itemsUrl =
					remoteServer +
					`api/queryindex?q=${encodeURIComponent(`/episodes/bypodcastguid?guid=${feedGuid}`)}`;

				let splitInfo = {};
				let valueBlock = { feed: null, item: null };

				const [feedData, itemsData] = await Promise.all([
					fetch(feedGuidUrl).then((res) => res.json()),
					fetch(itemsUrl).then((res) => res.json())
				]).catch((error) => {
					console.error('Error:', error);
				});

				let feed = feedData?.feed;
				splitInfo.feedGuid = feedGuid;
				splitInfo.itemGuid = itemGuid;
				splitInfo.album = feed?.title;
				splitInfo.artist = feed?.author;
				splitInfo.startTime = startTime;
				splitInfo.duration = duration;
				splitInfo.remotePercentage = remotePercentage;
				valueBlock.feed = feed?.value;

				let items = itemsData?.items;
				let item = items?.find((v) => v.guid === itemGuid);
				splitInfo.song = item?.title;
				valueBlock.item = item?.value;

				splitInfo.valueBlock = valueBlock.item || valueBlock.feed;
				return splitInfo;
			} else if (split['podcast:valueRecipient']) {
				let splitInfo = {};
				splitInfo.startTime = split?.['@_startTime'];
				splitInfo.duration = split?.['@_duration'];
				splitInfo.remotePercentage = split?.['@_remotePercentage'];
				let tempValueBlock = [].concat(split['podcast:valueRecipient']);
				let valueBlock = {
					model: {
						type: 'lightning',
						method: 'keysend'
					},
					destinations: []
				};

				valueBlock.destinations = tempValueBlock
					.map((v) => {
						let block = {};
						if (v['@_address']) {
							block.address = v['@_address'];
							block.customKey = v['@_customKey'];
							block.customValue = v['@_customValue'];
							block.name = v['@_name'];
							block.split = Number(v['@_split']) || 100;
							block.type = v['@_type'] || 'node';
						}
						return block;
					})
					.filter((v) => v);
				splitInfo.valueBlock = valueBlock;
				return splitInfo;
			}
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

	$: console.log($playingSong);
	$: console.log(song);
</script>

<playlist-container>
	<h2>Favorites</h2>

	<ul>
		{#each Object.entries($favorites) || [] as [key, song], index}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<li on:click={playSong.bind(this, song)}>
				{#if $player && !$player.paused && index === $playingIndex}
					<Pause size="32" />
				{:else}
					<Play size="32" />
				{/if}
				<img width="40" src={song.artwork} />
				<p>{song.title}</p>
				<menu-container>
					<button on:click|stopPropagation|capture={() => (expandMenu = !expandMenu)}>
						<MoreVert size="24" />
					</button>
					{#if expandMenu}
						<menu>
							<ul transition:slide>
								<li on:click|stopPropagation={handleShowModal.bind(this, 'playlist-add')}>
									Add to Playlist
								</li>
							</ul>
						</menu>
					{/if}
				</menu-container>
			</li>
		{/each}
	</ul>
</playlist-container>

{#if expandMenu}
	<closer
		on:click={() => {
			expandMenu = false;
		}}
	/>
{/if}

<Modals bind:showModal>
	{#if modalType === 'playlist-add'}
		<AddSongToPlaylist song={{ ...song, album: $selectedAlbum }} />
	{:else if modalType === 'playlist-remove'}
		<RemoveConfirmModal bind:showModal item={song} {index} itemType="playlist-song" />
	{/if}
</Modals>

<style>
	h2 {
		padding: 8px;
		margin: 0;
		text-align: center;
	}
	ul {
		padding: 0;
		margin: 4px 0;
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
		position: fixed;
		height: 100vh;
		width: 100vw;
		top: 0;
		left: 0;
		z-index: 2;
	}
</style>
