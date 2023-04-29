<script>
	export let data = {};
	import {
		selectedAlbum,
		playingAlbum,
		player,
		playingSong,
		posterSwiper,
		library,
		timeValueSplitBlock
	} from '$/stores';
	$selectedAlbum = data.album;
	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';

	// $: console.log($library);
	// $: console.log($selectedAlbum);
	$: console.log($timeValueSplitBlock);
	async function playSong(song) {
		if ($player.src !== song.enclosure['@_url']) {
			$player.pause();
			$player.src = song.enclosure['@_url'];
			$playingSong = song;
		}

		$playingAlbum = $selectedAlbum;
		$playingAlbum.title = $playingAlbum.title;
		$playingAlbum.author = $playingAlbum.author;

		const splits = song?.['podcast:value']?.['podcast:valueTimeSplit'] || [];

		async function handleSplit(split) {
			if (split['podcast:remoteItem']) {
				const feedGuid = split['podcast:remoteItem']?.['@_feedGuid'];
				const itemGuid = split['podcast:remoteItem']?.['@_itemGuid'];
				const startTime = split?.['@_startTime'];
				const duration = split?.['@_duration'];
				const remoteSplit = split?.['@_remoteSplit'];
				const feedGuidUrl = `/api/queryindex?q=${encodeURIComponent(
					`/podcasts/byguid?guid=${feedGuid}`
				)}`;
				const itemsUrl = `/api/queryindex?q=${encodeURIComponent(
					`/episodes/bypodcastguid?guid=${feedGuid}`
				)}`;

				let splitInfo = {};
				let valueBlock = { feed: null, item: null };

				const [feedData, itemsData] = await Promise.all([
					fetch(feedGuidUrl).then((res) => res.json()),
					fetch(itemsUrl).then((res) => res.json())
				]).catch((error) => {
					console.error('Error:', error);
				});

				let feed = JSON.parse(feedData)?.feed;
				splitInfo.album = feed?.title;
				splitInfo.artist = feed?.author;
				splitInfo.startTime = startTime;
				splitInfo.duration = duration;
				splitInfo.remoteSplit = remoteSplit;
				valueBlock.feed = feed?.value;

				let items = JSON.parse(itemsData)?.items;
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
</script>

<svelte:head>
	{#if $selectedAlbum}
		<meta name="description" content={`${$selectedAlbum.author} - ${$selectedAlbum.title}`} />
		<meta property="og:site_name" content="LN Beats" />
		<meta property="og:title" content={`${$selectedAlbum.author} - ${$selectedAlbum.title}`} />
		<meta property="og:description" content="Listen on LN Beats" />
		<meta property="og:image" content={$selectedAlbum.artwork || $selectedAlbum.image} />
		<meta property="og:url" content={`https://lnbeats.com/album/${$selectedAlbum.id}`} />

		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:title" content={`${$selectedAlbum.author} - ${$selectedAlbum.title}`} />
		<meta property="twitter:description" content="Listen on LN Beats" />
		<meta property="twitter:image" content={$selectedAlbum.artwork || $selectedAlbum.image} />
		<meta property="twitter:url" content={`https://lnbeats.com/album/${$selectedAlbum.id}`} />
	{/if}
</svelte:head>

<ul>
	<header>
		<img src={$selectedAlbum.image || $selectedAlbum.artwork} />
		<h2>{$selectedAlbum.title}</h2>
		{#if !$library[$selectedAlbum.id]}
			<AddToLibraryButton />
		{/if}
	</header>

	{#each $selectedAlbum.songs as song}
		<li on:click={playSong.bind(this, song)}>
			<p>{song.title}</p>
		</li>
	{/each}
</ul>

<style>
	header {
		display: flex;
		position: relative;
	}
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		list-style: none;
		justify-content: space-between;
		border-bottom: 1px solid var(--color-text-2);
		padding: 8px;
	}

	h1 {
		margin-top: 0;
	}

	p {
		text-align: left;
		width: 100%;
		margin: 4px;
		padding: 0;
		margin: 0;
	}

	img {
		width: 100px;
		height: 100px;
		border-radius: 8px;
		margin: 8px;
	}
</style>
