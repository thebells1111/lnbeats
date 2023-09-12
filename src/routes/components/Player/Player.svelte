<script>
	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';
	import clone from 'just-clone';
	import sendBoost from '$functions/sendBoost';
	import loadSong from '$functions/loadSong';
	import {
		player,
		playingSong,
		playingAlbum,
		satsPerSong,
		valueTimeSplitBlock,
		user,
		webln,
		currentSplitDestinations,
		playingIndex,
		playingChapters,
		currentPlayingChapter,
		currentChapterIndex,
		chapterBoostBypass,
		remoteServer,
		top100Playing,
		top100
	} from '$/stores';

	const parserOptions = {
		attributeNamePrefix: '@_',
		//attrNodeName: false,
		//textNodeName : "#text",
		ignoreAttributes: false,
		ignoreNameSpace: false,
		attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
		tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
	};

	import PlayBar from './PlayBar.svelte';
	import { onMount } from 'svelte';
	let currentSplit;
	let previousSplit;
	let startSplitTime = 0;
	let runningSplitTime = 0;
	let minBoostTime = 30;

	async function gotoNextSong() {
		const album = $playingAlbum ?? {};
		const currentSong = $playingSong ?? {};

		if (album.songs && currentSong.enclosure) {
			if (
				$playingIndex >= 0 &&
				($playingIndex < album.songs.length - 1 ||
					($top100Playing && $playingIndex < $top100.length - 1))
			) {
				$playingIndex = $playingIndex + 1;
				let nextSong;
				if ($top100Playing) {
					let _nextSong = $top100[$playingIndex - 1];
					console.log(_nextSong);
					let podcastIndexId = _nextSong.podcastIndexId;
					console.log(podcastIndexId);
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
							return v.title == _nextSong.title;
						});

						nextSong = foundSong;
					} catch (err) {
						console.log(err);
					}
				} else {
					nextSong = album.songs[$playingIndex];
				}
				loadSong(nextSong);

				if (nextSong.playlist) {
					$playingAlbum = {
						...$playingAlbum,
						album: nextSong.album,
						title: nextSong.album.title,
						artwork: nextSong.album.artwork || nextSong.album.image,
						author: nextSong.album.author
					};
				}
			}
		}
	}

	function setupPlayer() {
		$player.ontimeupdate = updatePlayerTime;
		$player.onloadedmetadata = () => {
			$player.duration = $player.duration;
		};
		$player.onended = async () => {
			gotoNextSong();
			handleAutoBoost(
				$playingSong?.['@_value']?.destinations || $playingAlbum?.['@_value']?.destinations
			);
		};
	}

	onMount(setupPlayer);

	function updatePlayerTime() {
		const currentTime = $player.currentTime;
		findCurrentChapter(currentTime);
		currentSplit = findCurrentSplit(currentTime);
		$player.currentTime = $player.currentTime;

		if (currentSplit) {
			if (isSameSplit(currentSplit, previousSplit)) {
				runningSplitTime = currentTime - startSplitTime;
			} else {
				handleNewSplit(currentTime);
				console.log('split: ', currentSplit);
			}
		} else if (previousSplit?.duration) {
			handleNewSplit(currentTime);
		}
	}

	function findCurrentChapter(currentTime) {
		if ($playingChapters?.length) {
			while (currentTime >= $playingChapters?.[$currentChapterIndex + 1]?.startTime) {
				$currentChapterIndex++;
			}

			while (currentTime < $playingChapters?.[$currentChapterIndex]?.startTime) {
				$currentChapterIndex--;
			}

			// if ($playingChapters?.[$currentChapterIndex]?.endTime) {
			// 	if ($player.currentTime > $playingChapters[$currentChapterIndex].endTime) {
			// 		$useDefaultChapter = true;
			// 	} else {
			// 		$useDefaultChapter = false;
			// 	}
			// } else {
			// 	$useDefaultChapter = false;
			// }

			let foundChapter = $playingChapters[$currentChapterIndex];

			if (JSON.stringify($currentPlayingChapter) !== JSON.stringify(foundChapter)) {
				$currentPlayingChapter = foundChapter;
			}
		}
	}

	function findCurrentSplit(currentTime) {
		let activeItem = null;

		$valueTimeSplitBlock.forEach((item) => {
			let startTime = parseFloat(item.startTime);
			let duration = parseFloat(item.duration);

			if (startTime <= currentTime && startTime + duration > currentTime) {
				if (activeItem == null || startTime > parseFloat(activeItem.startTime)) {
					activeItem = item;
				}
			}
		});

		return activeItem;
	}

	function isSameSplit(split1, split2) {
		return JSON.stringify(split1) === JSON.stringify(split2);
	}

	function handleNewSplit(currentTime) {
		if (shouldBoost() && $user.loggedIn) {
			console.log('BOOST CHECK');
			console.log($currentSplitDestinations);
			if ($chapterBoostBypass) {
				$chapterBoostBypass = false;
			} else {
				console.log('BOOST');
				handleAutoBoost($currentSplitDestinations);
			}
		}

		startSplitTime = currentTime;
		runningSplitTime = 0;

		if (currentSplit) {
			const destinations = buildDestinations(currentSplit);

			let feedValue = clone(
				$playingSong?.['podcast:value']?.['podcast:valueRecipient'] ||
					$playingAlbum?.['podcast:value']?.['podcast:valueRecipient']
			);

			// feedValue = [
			// 	{
			// 		'@_name': 'steven@getalby.com',
			// 		'@_type': 'node',
			// 		'@_address': '030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3',
			// 		'@_customKey': '696969',
			// 		'@_customValue': 'eChoVKtO1KujpAA5HCoB',
			// 		'@_split': 1,
			// 		'@_fee': true
			// 	}
			// ].concat(feedValue);
			// console.log(feedValue);
			const feedDestinations = updateSplits(feedValue, 100 - currentSplit.remotePercentage);

			const remoteDestinations = updateSplits(destinations, currentSplit.remotePercentage);

			$currentSplitDestinations = remoteDestinations
				.map(removeUndefinedKeys)
				.concat(feedDestinations);
		} else {
			$currentSplitDestinations = undefined;
		}

		previousSplit = currentSplit;
		console.log(currentSplit);
	}

	function buildDestinations(split) {
		return split?.valueBlock?.destinations?.map((v) => ({
			'@_address': v.address,
			'@_customKey': v.customKey,
			'@_customValue': v.customValue,
			'@_name': v.name,
			'@_type': split?.valueBlock?.model.type,
			'@_split': v.split,
			'@_fee': v?.fee
		}));
	}

	function removeUndefinedKeys(obj) {
		return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
	}

	function updateSplits(array, remotePercentage) {
		const newArray = [].concat(array);
		const totalSplit = newArray.reduce((acc, item) => {
			return acc + (item?.['@_fee'] !== true && item?.['@_fee'] !== 'true' ? item['@_split'] : 0);
		}, 0);
		const remotePercentagePercentage = Number(remotePercentage) / 100;

		newArray.forEach((item) => {
			if (item?.['@_fee'] !== true && item?.['@_fee'] !== 'true') {
				item['@_split'] = Math.floor(
					(item['@_split'] / totalSplit) * remotePercentagePercentage * 100
				);
			}
		});

		return newArray;
	}

	function shouldBoost() {
		return runningSplitTime >= minBoostTime - 1 || runningSplitTime >= previousSplit?.duration - 1;
	}

	async function handleAutoBoost(destinations) {
		if ($satsPerSong > 0 && destinations) {
			try {
				sendBoost({
					webln: $webln,
					destinations,
					satAmount: $satsPerSong,
					wallet: $user.preferences.wallet
				});
			} catch (err) {
				$satsPerSong = 0;
			}
		}
	}
</script>

<audio playsinline preload="metadata" bind:this={$player} />

<PlayBar />

<style>
</style>
