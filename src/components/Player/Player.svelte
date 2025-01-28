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
		playingTranscript,
		playingTranscriptText,
		currentTranscriptIndex,
		chapterBoostBypass,
		remoteServer,
		top100,
		currentSplit,
		favorites,
		favoritesDB,
		mediaSession,
		remotePlaylistPlaying,
		remotePlaylist,
		playingSongList
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
	let previousSplit;
	let startSplitTime = 0;
	let runningSplitTime = 0;
	let minBoostTime = 30;

	async function gotoNextSong() {
		const album = $playingAlbum ?? {};
		const currentSong = $playingSong ?? {};

		if ($playingSongList && currentSong.enclosure) {
			if (
				($playingIndex >= 0 &&
					($playingIndex < album?.songs?.length - 1 ||
						($remotePlaylistPlaying &&
							$playingIndex < $remotePlaylist?.remoteSongs?.length - 1))) ||
				album.favorites
			) {
				$playingIndex = $playingIndex + 1;
				let nextSong;
				let _nextSong;
				if ($remotePlaylistPlaying) {
					if ($playingIndex === $remotePlaylist?.remoteSongs?.length) {
						$playingIndex = 0;
					}

					_nextSong = $remotePlaylist?.remoteSongs?.[$playingIndex];
					let feedGuid = _nextSong['@_feedGuid'];
					let feedUrl =
						remoteServer +
						`api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${feedGuid}`)}`;

					console.log(_nextSong);

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
						console.log(feed);
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

						console.log($playingAlbum);

						let foundSong;
						if ($remotePlaylist?.remoteSongs) {
							foundSong = $playingAlbum.songs.find(
								(v) => v.guid['#text'] == _nextSong['@_itemGuid']
							);
						}

						nextSong = foundSong;
					} catch (err) {
						console.log(err);
					}
				} else if (album.favorites) {
					let favs = Object.entries($favorites);
					let nextIndex = favs.findIndex((v) => v[0] === album.favorites) + 1;
					let song = await favoritesDB.getItem(favs[nextIndex][0]);

					$playingAlbum = {
						album: song.album,
						favorites: favs[nextIndex][0],
						title: song.album.title,
						artwork: song.album.artwork || song.album.image,
						songs: song,
						author: song.album.author,
						podcastGuid: song.album.podcastGuid
					};
					nextSong = song;
				} else {
					nextSong = $playingSongList[$playingIndex];
				}
				loadSong(nextSong);
			}
		}
	}

	function setupPlayer() {
		$player.ontimeupdate = updatePlayerTime;
		$mediaSession = navigator.mediaSession;
		setHandlers();

		$player.onloadedmetadata = () => {
			$player.duration = $player.duration;
			if ($mediaSession) {
				$mediaSession.metadata = new MediaMetadata({
					title: $playingSong.title,
					artist: $playingAlbum.author,
					artwork: [
						{
							src:
								$currentPlayingChapter?.img ||
								$playingSong.image ||
								$playingSong.artwork ||
								$playingSong?.['itunes:image']?.['@_href'] ||
								$playingAlbum.image ||
								$playingAlbum.artwork ||
								$playingAlbum?.['itunes:image']?.['@_href'] ||
								'./lnbeats_logo_black_circle_512.png',
							sizes: '512x512',
							type: 'image/png'
						}
					]
				});
			}
		};
		$player.onended = async () => {
			handleAutoBoost(
				$playingSong?.['podcast:value']?.['podcast:valueRecipient'] ||
					$playingAlbum?.['podcast:value']?.['podcast:valueRecipient']
			);
			gotoNextSong();
		};
	}

	onMount(setupPlayer);

	function updatePlayerTime() {
		const currentTime = $player.currentTime;
		findCurrentChapter(currentTime);
		findCurrentTranscript(currentTime);
		$currentSplit = findCurrentSplit(currentTime);
		$player.currentTime = $player.currentTime;

		if ($currentSplit) {
			if (isSameSplit($currentSplit, previousSplit)) {
				runningSplitTime = currentTime - startSplitTime;
			} else {
				handleNewSplit(currentTime);
				console.log('split: ', $currentSplit);
			}
		} else if (previousSplit?.duration) {
			handleNewSplit(currentTime);
		}
	}

	function findCurrentTranscript(currentTime) {
		if ($playingTranscript?.length) {
			if (currentTime < $playingTranscript[0]) {
				$currentTranscriptIndex = undefined;
			} else {
				$currentTranscriptIndex = $currentTranscriptIndex || 0;
			}
			while (currentTime >= $playingTranscript?.[$currentTranscriptIndex + 1]?.start) {
				$currentTranscriptIndex++;
			}

			while (currentTime < $playingTranscript?.[$currentTranscriptIndex]?.start) {
				$currentTranscriptIndex--;
			}
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

		if ($currentSplit?.valueBlock) {
			const destinations = buildDestinations($currentSplit);

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
			const feedDestinations = updateSplits(feedValue, 100 - $currentSplit.remotePercentage);

			const remoteDestinations = updateSplits(destinations, $currentSplit.remotePercentage);

			$currentSplitDestinations = remoteDestinations
				.map(removeUndefinedKeys)
				.concat(feedDestinations);
		} else {
			$currentSplitDestinations = undefined;
		}

		previousSplit = $currentSplit;
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

	function updateSplits(_array, remotePercentage) {
		const array = clone(_array);
		const newArray = [].concat(array);
		const totalSplit = newArray.reduce((accumulator, currentItem) => {
			const splitValue = currentItem?.['@_fee'] !== true ? Number(currentItem['@_split']) : 0;
			return accumulator + splitValue;
		}, 0);
		const remotePercentagePercentage = Number(remotePercentage) / 100;

		newArray.forEach((item) => {
			if (item?.['@_fee'] !== true) {
				item['@_split'] =
					Math.round((item['@_split'] / totalSplit) * remotePercentagePercentage * 100 * 100) / 100;
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

	function setHandlers() {
		const actionHandlers = [
			[
				'play',
				() => {
					$player.play();
					$mediaSession.playbackState = 'playing';
					console.log('play');
				}
			],
			[
				'pause',
				() => {
					$player.pause();
					$mediaSession.playbackState = 'paused';
					console.log('pause');
				}
			],
			['previoustrack', mediaGotoPreviousSong],
			['nexttrack', mediaGotoNextSong],
			[
				'stop',
				() => {
					/* ... */
				}
			],
			[
				'seekbackward',
				(details) => {
					$player.currentTime = Math.max($player.currentTime - 10, 0);
				}
			],
			[
				'seekforward',
				(details) => {
					print(details);
					$player.currentTime = Math.min($player.currentTime + 30, $player.duration);
				}
			],
			[
				'seekto',
				(details) => {
					print(details);
				}
			]
		];

		for (const [action, handler] of actionHandlers) {
			try {
				$mediaSession.setActionHandler(action, handler);
			} catch (error) {
				print(`The media session action "${action}" is not supported yet.`);
			}
		}
	}

	async function mediaGotoNextSong() {
		if ($currentChapterIndex < $playingChapters?.length - 1) {
			$currentChapterIndex++;
			$currentPlayingChapter = $playingChapters[$currentChapterIndex];
			$player.currentTime = $currentPlayingChapter.startTime;
			$chapterBoostBypass = true;
		} else {
			let album = $playingAlbum;
			let currentSong = $playingSong;
			if (
				($playingSongList || $remotePlaylistPlaying) &&
				(currentSong?.enclosure || currentSong?.enclosure?.['@_url'])
			) {
				if (
					($playingIndex >= 0 &&
						($playingIndex < album?.songs?.length - 1 ||
							($remotePlaylistPlaying &&
								$playingIndex < $remotePlaylist?.remoteSongs?.length - 1))) ||
					album.favorites
				) {
					$playingIndex = $playingIndex + 1;
					let nextSong;
					let _nextSong;
					if ($remotePlaylistPlaying) {
						if ($playingIndex === $remotePlaylist.length) {
							$playingIndex = 1;
						}

						_nextSong = $remotePlaylist?.remoteSongs?.[$playingIndex];
						let feedGuid = _nextSong['@_feedGuid'];
						let feedUrl =
							remoteServer +
							`api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${feedGuid}`)}`;

						console.log(_nextSong);

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
							console.log(feed);
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

							console.log($playingAlbum);

							let foundSong;
							if ($remotePlaylist?.remoteSongs) {
								foundSong = $playingAlbum.songs.find(
									(v) => v.guid['#text'] == _nextSong['@_itemGuid']
								);
							}

							nextSong = foundSong;
						} catch (err) {
							console.log(err);
						}
					} else if (album.favorites) {
						let favs = Object.entries($favorites);
						let nextIndex = favs.findIndex((v) => v[0] === album.favorites) + 1;
						let song = await favoritesDB.getItem(favs[nextIndex][0]);

						$playingAlbum = {
							album: song.album,
							favorites: favs[nextIndex][0],
							title: song.album.title,
							artwork: song.album.artwork || song.album.image,
							songs: song,
							author: song.album.author,
							podcastGuid: song.album.podcastGuid
						};
						nextSong = song;
					} else {
						nextSong = $playingSongList[$playingIndex];
					}
					loadSong(nextSong);
				}
			}
		}
	}

	async function mediaGotoPreviousSong() {
		if ($currentChapterIndex > 0) {
			$currentChapterIndex--;
			$currentPlayingChapter = $playingChapters[$currentChapterIndex];
			$player.currentTime = $currentPlayingChapter.startTime;
			$chapterBoostBypass = true;
		} else {
			let album = $playingAlbum;
			let currentSong = $playingSong;
			if (album?.songs && (currentSong?.enclosure || currentSong?.enclosure?.['@_url'])) {
				if ($playingIndex > 0 || album.favorites) {
					$playingIndex = $playingIndex - 1;
					let nextSong;
					let _nextSong;
					if ($remotePlaylistPlaying) {
						if ($playingIndex === $remotePlaylist?.remoteSongs?.length) {
							$playingIndex = 1;
						}

						_nextSong = $remotePlaylist?.remoteSongs?.[$playingIndex];
						let feedGuid = _nextSong['@_feedGuid'];
						let feedUrl =
							remoteServer +
							`api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${feedGuid}`)}`;

						console.log(_nextSong);

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
							console.log(feed);
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

							console.log($playingAlbum);

							let foundSong;
							if ($remotePlaylist?.remoteSongs) {
								foundSong = $playingAlbum.songs.find(
									(v) => v.guid['#text'] == _nextSong['@_itemGuid']
								);
							}

							nextSong = foundSong;
						} catch (err) {
							console.log(err);
						}
					} else if (album.favorites) {
						let favs = Object.entries($favorites);
						let nextIndex = favs.findIndex((v) => v[0] === album.favorites) - 1;
						let song = await favoritesDB.getItem(favs[nextIndex][0]);

						$playingAlbum = {
							album: song.album,
							favorites: favs[nextIndex][0],
							title: song.album.title,
							artwork: song.album.artwork || song.album.image,
							songs: song,
							author: song.album.author,
							podcastGuid: song.album.podcastGuid
						};
						nextSong = song;
					} else {
						nextSong = $playingSongList[$playingIndex];
					}
					loadSong(nextSong);
				}
			}
		}
	}
</script>

<svelte:head>
	{#if $playingSong.title}
		<title
			>Playing:
			{$playingSong.title} -
			{$playingAlbum.author}</title
		>
	{/if}
</svelte:head>

<audio playsinline preload="metadata" bind:this={$player} />

<PlayBar />

<style>
</style>
