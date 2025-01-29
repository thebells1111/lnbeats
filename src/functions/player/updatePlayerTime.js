import findCurrentChapter from './findCurrentChapter';
import findCurrentTranscript from './findCurrentTranscript';
import findCurrentSplit from './findCurrentSplit';
import handleAutoBoost from './handleAutoBoost';
import getStores from '$functions/getStores';

import {
	playingSong,
	playingAlbum,
	currentSplit,
	currentSplitDestinations,
	chapterBoostBypass,
	user
} from '$/stores';

let previousSplit;
let startSplitTime = 0;
let runningSplitTime = 0;
let minBoostTime = 30;

function updatePlayerTime(currentTime) {
	let { $currentSplit } = getStores({ currentSplit });

	findCurrentChapter(currentTime);
	findCurrentTranscript(currentTime);
	$currentSplit = findCurrentSplit(currentTime);

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

	currentSplit.set($currentSplit);
}

function isSameSplit(split1, split2) {
	return JSON.stringify(split1) === JSON.stringify(split2);
}

function handleNewSplit(currentTime) {
	let {
		$playingSong,
		$playingAlbum,
		$currentSplit,
		$currentSplitDestinations,
		$chapterBoostBypass,
		$user
	} = getStores(
		playingSong,
		playingAlbum,
		currentSplit,
		currentSplitDestinations,
		chapterBoostBypass,
		user
	);
	if (shouldBoost() && $user.loggedIn) {
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

		const feedDestinations = updateSplits(feedValue, 100 - $currentSplit.remotePercentage);
		const remoteDestinations = updateSplits(destinations, $currentSplit.remotePercentage);

		$currentSplitDestinations = remoteDestinations
			.map(removeUndefinedKeys)
			.concat(feedDestinations);
	} else {
		$currentSplitDestinations = undefined;
	}

	previousSplit = $currentSplit;
	currentSplitDestinations.set($currentSplitDestinations);
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

export default updatePlayerTime;
