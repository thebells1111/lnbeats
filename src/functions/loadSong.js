import Hls from "hls.js";

import {
	playingSong,
	playingAlbum,
	player,
	hls,
	remoteServer,
	playingChapters,
	currentPlayingChapter,
	currentChapterIndex,
	currentSplitDestinations,
	valueTimeSplitBlock,
	playingTranscriptText
} from '$/stores';
import { get } from 'svelte/store';
const $valueTimeSplitBlock = get(valueTimeSplitBlock);

export default async function loadSong(song) {
	let _player = get(player);
	_player.pause();
	playingSong.set(song);
	setPlayerSource(song.enclosure['@_url']);
	playingChapters.set([]);
	currentPlayingChapter.set(null);
	currentSplitDestinations.set(null);
	currentChapterIndex.set(0);

	if (song?.['podcast:chapters']) {
		let res = await fetch(
			remoteServer + `api/proxy?url=${encodeURIComponent(song['podcast:chapters']['@_url'])}`
		);
		let data = await res.json();
		playingChapters.set(data?.chapters);
	}

	if (
		song?.['podcast:transcript'] &&
		(song?.['podcast:transcript']['@_type'] === 'application/srt' ||
			song?.['podcast:transcript']['@_type'] === 'application/x-rip')
	) {
		let res = await fetch(
			remoteServer + `api/proxy?url=${encodeURIComponent(song['podcast:transcript']['@_url'])}`
		);
		let data = res.ok ? await res.text() : '';
		playingTranscriptText.set(data);
		// playingChapters.set(data?.chapters);
	} else {
		playingTranscriptText.set('');
	}

	const splits = song?.['podcast:value']?.['podcast:valueTimeSplit'] || [];

	if (splits.length > 0) {
		let splitInfo = await handleSplit(splits[0]);
		$valueTimeSplitBlock[0] = splitInfo;
		valueTimeSplitBlock.set($valueTimeSplitBlock);
	}

	setTimeout(() => _player.play(), 200);

	for (let i = 1; i < splits.length; i++) {
		let split = splits[i];
		$valueTimeSplitBlock[i] = await handleSplit(split);
		valueTimeSplitBlock.set($valueTimeSplitBlock);
	}

	function setPlayerSource(src) {
		let _hls = null;

		if (!_player || !src) { // missing params
			console.error("No player or nothing to play!");
		}
		else if (
			!src.includes(".m3u8") || _player.canPlayType("application/vnd.apple.mpegurl")
		) {
			// native player
			_player.src = src;
			hls.set(null);
		}
		else if (Hls.isSupported()) {
			// hls player
			_hls = new Hls();

			// bind them together
			_hls.attachMedia(_player);

			// MEDIA_ATTACHED event is fired by hls object once MediaSource is ready
			_hls.on(Hls.Events.MEDIA_ATTACHED, function () {
				// console.log("video and hls.js are now bound together !");
				_hls.loadSource(src);
				_hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
					console.log(
						"manifest loaded, found " +
						data.levels.length +
						" quality level"
					);
				});
			});
		}
		else {
			console.error("Unable to play video");
		}

		hls.set(_hls);
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
