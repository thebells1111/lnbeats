<script>
	import localforage from 'localforage';
	import { slide } from 'svelte/transition';
	import Modals from '$c/Modals/Modals.svelte';
	import MoreVert from '$icons/MoreVert.svelte';
	import Play from '$icons/PlayArrow.svelte';
	import Pause from '$icons/Pause.svelte';
	import {
		selectedAlbum,
		playingAlbum,
		player,
		playingSong,
		posterSwiper,
		playingIndex,
		timeValueSplitBlock,
		remoteServer
	} from '$/stores';
	import AddSongToPlaylist from '$c/CreatePlaylist/AddSongToPlaylist.svelte';
	import RemoveConfirmModal from '$routes/library/RemoveConfirmModal.svelte';

	export let song;
	export let index;
	$: console.log(song);

	let expandMenu = false;
	let modalStatus = false;
	let modalType;

	async function playSong() {
		if (song.playlist) {
			const playlistDB = localforage.createInstance({
				name: 'playlistDB'
			});
			const playlist = await playlistDB.getItem(song.playlist);
			// console.log(playlist)
			// const { artwork, image, podcastGuid, title, author } = song.album;
			$playingAlbum = {
				album: song.album,
				playlist: song.playlist,
				title: song.album.title,
				artwork: song.album.artwork || song.album.image,
				songs: playlist,
				author: song.album.author
			};
		} else {
			$playingAlbum = $selectedAlbum;
			$playingAlbum.title = $playingAlbum.title;
			$playingAlbum.author = $playingAlbum.author;
			$playingIndex = null;
		}

		if ($playingIndex !== index) {
			$player.pause();
			$player.src = song.enclosure['@_url'];
			$playingSong = song;
			$playingIndex = index;
		}

		const splits = song?.['podcast:value']?.['podcast:valueTimeSplit'] || [];

		async function handleSplit(split) {
			if (split['podcast:remoteItem']) {
				const feedGuid = split['podcast:remoteItem']?.['@_feedGuid'];
				const itemGuid = split['podcast:remoteItem']?.['@_itemGuid'];
				const startTime = split?.['@_startTime'];
				const duration = split?.['@_duration'];
				const remoteSplit = split?.['@_remoteSplit'];
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
				splitInfo.album = feed?.title;
				splitInfo.artist = feed?.author;
				splitInfo.startTime = startTime;
				splitInfo.duration = duration;
				splitInfo.remoteSplit = remoteSplit;
				valueBlock.feed = feed?.value;

				let items = itemsData?.items;
				let item = items?.find((v) => v.guid === itemGuid);
				splitInfo.song = item?.title;
				valueBlock.item = item?.value;

				splitInfo.valueBlock = valueBlock.item || valueBlock.feed;
				return splitInfo;
			}
		}

		if (splits.length > 0) {
			handleSplit(splits[0]).then((splitInfo) => {
				$timeValueSplitBlock[0] = splitInfo;
			});
		}

		$player.play();

		$player.paused = $player.paused;
		openPoster();
		for (let i = 1; i < splits.length; i++) {
			let split = splits[i];
			$timeValueSplitBlock[i] = await handleSplit(split);
		}
	}

	function openPoster() {
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
		// setTimeout(() => $posterSwiper.slideTo(1), 1000);
	}

	function showModal(type) {
		expandMenu = false;
		modalStatus = true;
		modalType = type;
		console.log(modalType);
	}
</script>

<li on:click={playSong}>
	{#if $player && !$player.paused && index === $playingIndex}
		<Pause size="32" />
	{:else}
		<Play size="32" />
	{/if}

	<p>{song.title}</p>
	<menu-container>
		<button on:click|stopPropagation|capture={() => (expandMenu = !expandMenu)}>
			<MoreVert size="24" />
		</button>
		{#if expandMenu}
			<menu>
				<ul transition:slide>
					<li on:click|stopPropagation={showModal.bind(this, 'playlist-add')}>Add to Playlist</li>
					{#if song.playlist}
						<li on:click|stopPropagation={showModal.bind(this, 'playlist-remove')}>Remove</li>
					{/if}
				</ul>
			</menu>
		{/if}
	</menu-container>
</li>

{#if expandMenu}
	<closer
		on:click={() => {
			expandMenu = false;
		}}
	/>
{/if}

<Modals bind:modalStatus>
	{#if modalType === 'playlist-add'}
		<AddSongToPlaylist song={{ ...song, album: $selectedAlbum }} />
	{:else if modalType === 'playlist-remove'}
		<RemoveConfirmModal bind:modalStatus item={song} {index} itemType="playlist-song" />
	{/if}
</Modals>

<style>
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
