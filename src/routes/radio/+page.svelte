<script>
	import keyedAlbums from './keyedAlbums.json';
	import songs from './songs.json';

	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';
	import PlayArrow from '$icons/PlayArrow.svelte';
	import AppSupport from './AppSupport.svelte';

	import {
		lnbRadio,
		lnbRadioAlbums,
		playingIndex,
		lnbRadioPlaying,
		top100Playing,
		playingSong,
		player,
		playingAlbum,
		playingChapters,
		currentPlayingChapter,
		remoteServer,
		valueTimeSplitBlock,
		selectedAlbum,
		posterSwiper
	} from '$/stores';

	let showAppSupport = false;

	if (!$lnbRadio.length) {
		$lnbRadio = shuffleArray(songs);
		$lnbRadioAlbums = keyedAlbums;
	}

	const parserOptions = {
		attributeNamePrefix: '@_',
		//attrNodeName: false,
		//textNodeName : "#text",
		ignoreAttributes: false,
		ignoreNameSpace: false,
		attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
		tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
	};

	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	function handlePlay() {
		$lnbRadioPlaying = true;
		$lnbRadio = shuffleArray(songs);
		$playingIndex = 0;
		playRadioSong($lnbRadio[$playingIndex]);
	}

	async function playRadioSong(song) {
		let albumUrl =
			remoteServer +
			`api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${song.album.podcastGuid}`)}`;
		let albumRes = await fetch(albumUrl);
		let albumData = await albumRes.json();
		$playingAlbum = albumData.feed;

		const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
		let data = await res.text();

		let xml2Json = parse(data, parserOptions);
		let feed = xml2Json.rss.channel;

		if (feed) {
			console.log(feed);
			song = [].concat(feed.item).find((v) => JSON.stringify(v.guid) === JSON.stringify(song.guid));
		}

		$top100Playing = false;
		if (song['podcast:chapters']) {
			fetch(remoteServer + `api/proxy?url=${encodeURIComponent(song['podcast:chapters']['@_url'])}`)
				.then((res) => res.json())
				.then((data) => ($playingChapters = data?.chapters))
				.then(() => console.log($playingChapters));
		} else {
			$playingChapters = [];
			$currentPlayingChapter = undefined;
		}

		$playingAlbum.title = $playingAlbum.title;
		$playingAlbum.author = $playingAlbum.author;

		$player.pause();
		$player.src = song.enclosure['@_url'];
		$playingSong = song;

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
		function openPoster() {
			document.getElementById('poster-swiper').style.visibility = 'initial';
			$posterSwiper.slideTo(1);
			// setTimeout(() => $posterSwiper.slideTo(1), 1000);
		}
	}
</script>

<div>
	<h3>Randomly playing every <br /> v4v track available</h3>
	<button class="play" on:click={handlePlay}>
		<PlayArrow size="120" />
	</button>
</div>

<button
	class="support"
	on:click={() => {
		showAppSupport = true;
		thhe;
	}}
	>I make the app, <br />you send the sats. <br />
	<p>Support LNBeats</p></button
>

{#if showAppSupport}
	<AppSupport bind:showBoostScreen={showAppSupport} />
{/if}

<style>
	div {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	button.play {
		width: 150px;
		color: var(--color-text-0);
		background-color: transparent;
	}

	h3 {
		text-align: center;
	}

	.support {
		margin: 24px auto 8px auto;
		width: 180px;
		border-radius: 90px;
		padding: 8px;
		background-color: var(--color-theme-yellow-light);
		background-image: linear-gradient(
			180deg,
			var(--color-theme-yellow-light) 15%,
			var(--color-theme-yellow-dark) 66%
		);
		color: var(--color-text-0);
	}

	.support p {
		margin: 0;
		font-size: 1.1em;
		font-weight: 550;
	}
</style>
