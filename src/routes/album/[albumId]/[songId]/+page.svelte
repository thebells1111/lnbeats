<script>
	import Album from '../+page.svelte';
	import { onMount } from 'svelte';
	import clone from 'just-clone';

	import {
		remoteServer,
		playingAlbum,
		player,
		playingSong,
		posterSwiper,
		valueTimeSplitBlock,
		playingChapters,
		currentPlayingChapter,
		playingTranscript,
		playingTranscriptText,
		currentTranscriptIndex,
		playingIndex
	} from '$/stores';
	import { decodeURL } from '$functions/songId';

	function isValidGuid(str) {
		const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		return regex.test(str);
	}

	export let data;
	let song;

	if (isValidGuid(data.songId)) {
		song = data.album.songs.find((v) => v.guid['#text'] === data.songId);
		console.log(data.album.songs.find((v) => v.guid['#text'] === 'data.songId'));
	} else {
		const songURL = decodeURL(data.songId);
		song = data.album.songs.find((v) => v.enclosure['@_url'] === songURL);
	}

	function loadSong(song) {
		console.log(song);
		if ($player.src !== song.enclosure['@_url']) {
			$player.pause();
			$player.src = song.enclosure['@_url'];
			$playingSong = song;
			// $playingIndex = index;
			handleMeta(song);
		}
		openPoster();
	}

	async function handleMeta(song) {
		$valueTimeSplitBlock = [];
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
				.then((res) => res.text())
				.then((data) => ($playingTranscriptText = data));
		} else {
			$playingTranscript = [];
			$playingTranscriptText = '';
			$currentTranscriptIndex = undefined;
		}

		const splits = song?.['podcast:value']?.['podcast:valueTimeSplit'] || [];

		if (splits.length > 0) {
			handleSplit(splits[0]).then((splitInfo) => {
				$valueTimeSplitBlock[0] = splitInfo;
			});
			let dbSplits = splits.map((v) => {
				return {
					title: $playingAlbum.title,
					podcastGuid: $playingAlbum.podcastGuid,
					remoteFeedGuid: v['podcast:remoteItem']['@_feedGuid'],
					remoteItemGuid: v['podcast:remoteItem']['@_itemGuid']
				};
			});
		}

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
		if ($posterSwiper) {
			document.getElementById('poster-swiper').style.visibility = 'initial';
			$posterSwiper.slideTo(1);
		} else {
			setTimeout(openPoster, 10);
		}
	}

	function initialSongLoad() {
		$playingAlbum = data.album;
		if (song) {
			loadSong(song);
		}
	}

	onMount(initialSongLoad);
</script>

<svelte:head>
	{#if data.album && song}
		<title>{`${data.album.author} - ${data.album.title} - ${song.title}`}</title>
		<meta
			name="description"
			content={`${data.album.author} - ${data.album.title} - ${song.title}`}
		/>
		<meta property="og:site_name" content="LN Beats" />
		<meta
			property="og:title"
			content={`${data.album.author} - ${data.album.title} - ${song.title}`}
		/>
		<meta property="og:description" content="Listen on LN Beats" />
		<meta
			property="og:image"
			content={song?.['itunes:image']?.['@_href'] || data.album.artwork || data.album.image}
		/>
		<meta
			property="og:url"
			content={`https://lnbeats.com/album/${data.album.podcastGuid}/${data.songId}`}
		/>

		<meta property="twitter:card" content="summary_large_image" />
		<meta
			property="twitter:title"
			content={`${data.album.author} - ${data.album.title} - ${song.title}`}
		/>
		<meta property="twitter:description" content="Listen on LN Beats" />
		<meta
			property="twitter:image"
			content={song?.['itunes:image']?.['@_href'] || data.album.artwork || data.album.image}
		/>
		<meta
			property="twitter:url"
			content={`https://lnbeats.com/album/${data.album.podcastGuid}/${data.songId}`}
		/>
	{/if}
</svelte:head>

{#if data}
	<Album {data} isSong={true} />
{/if}
