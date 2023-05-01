<script>
	import clone from 'just-clone';
	import sendBoost from '$functions/sendBoost';
	import loadSong from '$functions/loadSong';
	import {
		player,
		playingSong,
		playingAlbum,
		posterSwiper,
		satsPerSong,
		timeValueSplitBlock,
		user,
		webln,
		currentSplitDestinations
	} from '$/stores';
	import PlayBar from './PlayBar.svelte';
	import { onMount } from 'svelte';
	let currentSplit;
	let previousSplit;
	let startSplitTime = 0;
	let runningSplitTime = 0;
	let minBoostTime = 30;

	function gotoNextSong() {
		let album = $playingAlbum;
		let currentSong = $playingSong;
		if (album?.songs && currentSong?.enclosure) {
			let songIndex = album.songs.findIndex(
				(song) => song.enclosure['@_url'] === currentSong.enclosure['@_url']
			);
			if (songIndex > -1 && songIndex < album.songs.length - 1) {
				loadSong(album.songs[songIndex + 1]);
			}
		}
	}
	console.log($timeValueSplitBlock);

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

	function openPoster() {
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
		// setTimeout(() => $posterSwiper.slideTo(1), 1000);
	}

	function updatePlayerTime() {
		const currentTime = $player.currentTime;
		$player.currentTime = $player.currentTime;
		const currentSplit = findCurrentSplit(currentTime);

		if (currentSplit) {
			if (isSameSplit(currentSplit, previousSplit)) {
				runningSplitTime = currentTime - startSplitTime;
			} else {
				handleNewSplit(currentTime);
			}
		} else if (previousSplit?.duration) {
			handleNewSplit(currentTime);
		}
	}

	function findCurrentSplit(currentTime) {
		return $timeValueSplitBlock.find((block) => {
			const startTime = parseFloat(block.startTime);
			const endTime = startTime + parseFloat(block.duration);
			return currentTime >= startTime && currentTime <= endTime;
		});
	}

	function isSameSplit(split1, split2) {
		return JSON.stringify(split1) === JSON.stringify(split2);
	}

	function handleNewSplit(currentTime) {
		startSplitTime = currentTime;
		runningSplitTime = 0;

		if (shouldBoost()) {
			console.log('BOOST');
			handleAutoBoost($currentSplitDestinations);
		}

		if (currentSplit) {
			const destinations = buildDestinations(currentSplit);
			const feedDestinations = updateSplits(
				clone(
					$playingSong?.['podcast:value']?.['podcast:valueRecipient'] ||
						$playingAlbum?.['podcast:value']?.['podcast:valueRecipient']
				),
				100 - currentSplit.remoteSplit
			);
			const remoteDestinations = updateSplits(destinations, currentSplit.remoteSplit);
			$currentSplitDestinations = remoteDestinations
				.map(removeUndefinedKeys)
				.concat(feedDestinations);
		} else {
			$currentSplitDestinations = undefined;
		}
		console.log($currentSplitDestinations);
		previousSplit = currentSplit;
	}

	function buildDestinations(split) {
		return split?.valueBlock?.destinations?.map((v) => ({
			'@_address': v.address,
			'@_customKey': v.customKey,
			'@_customValue': v.customValue,
			'@_name': v.name,
			'@_type': split?.valueBlock?.model.type,
			'@_split': v.split,
			'@_fee': v.fee
		}));
	}

	function removeUndefinedKeys(obj) {
		return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
	}

	function updateSplits(array, remoteSplit) {
		const newArray = clone(array);
		const totalSplit = newArray.reduce(
			(acc, item) =>
				acc + (item['@_fee'] !== true && item['@_fee'] !== 'true' ? item['@_split'] : 0),
			0
		);
		const remoteSplitPercentage = Number(remoteSplit) / 100;

		newArray.forEach((item) => {
			if (item['@_fee'] !== true && item['@_fee'] !== 'true') {
				item['@_split'] = Math.floor((item['@_split'] / totalSplit) * remoteSplitPercentage * 100);
			}
		});

		return newArray;
	}

	function shouldBoost() {
		return runningSplitTime >= minBoostTime - 1 || runningSplitTime >= previousSplit?.duration - 1;
	}

	async function handleAutoBoost(destinations) {
		console.log(destinations);

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
