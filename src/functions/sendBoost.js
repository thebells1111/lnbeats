import {
	playingAlbum,
	playingSong,
	player,
	senderName,
	currentSplit,
	remoteServer
} from '$/stores';
import { get } from 'svelte/store';
import clone from 'just-clone';

export default async function sendBoost({
	webln,
	destinations,
	satAmount,
	boostagram,
	wallet,
	lockedSplit
}) {
	destinations = clone(destinations);

	// the xml parser returns an object if the feed has one split and an array if the feed has multiple splits
	// check if destinations is an object and convert it to an array
	if (typeof destinations === 'object' && !Array.isArray(destinations) && destinations !== null) {
		destinations = [destinations];
	}

	console.log(destinations);

	let hasPI = destinations.find(
		(v) => v['@_address'] === '03ae9f91a0cb8ff43840e3c322c4c61f019d8c1c3cea15a25cfc425ac605e61a4a'
	);

	let hasStevieB = destinations.find(
		(v) => v['@_address'] === '035ad2c954e264004986da2d9499e1732e5175e1dcef2453c921c6cdcc3536e9d8'
	);
	if (!hasPI) {
		destinations.push({
			'@_name': 'Podcastindex.org',
			'@_address': '03ae9f91a0cb8ff43840e3c322c4c61f019d8c1c3cea15a25cfc425ac605e61a4a',
			'@_type': 'node',
			'@_split': '1',
			'@_fee': 'true'
		});
	}

	if (!hasStevieB) {
		destinations.push({
			'@_address': '035ad2c954e264004986da2d9499e1732e5175e1dcef2453c921c6cdcc3536e9d8',
			'@_name': 'LN Beats',
			'@_split': '3',
			'@_type': 'node',
			'@_fee': 'true'
		});
	}

	let runningTotal = satAmount;

	let payments = [];

	let { feesDestinations, splitsDestinations } = normalizeSplits(destinations);

	for (const dest of feesDestinations) {
		let feeRecord = filterEmptyKeys(getBaseRecord({ satAmount, boostagram, lockedSplit }));

		let amount = Math.round((dest['@_split'] / 100) * satAmount);
		if (amount > 0) {
			runningTotal -= amount;
			feeRecord.name = dest['@_name'];
			feeRecord.value_msat = amount * 1000;

			let customRecords = { 7629169: JSON.stringify(feeRecord) };

			if (dest['@_customKey']) {
				customRecords[dest['@_customKey']] = dest['@_customValue'];
			}

			try {
				let record = {
					destination: dest['@_address'],
					amount: amount,
					customRecords: customRecords
				};
				if (wallet === 'albyApi') {
					payments.push(record);
				} else if ((wallet = 'webln')) {
					await webln.keysend(record);
				}
			} catch (err) {
				alert(`error with  ${dest['@_name']}:  ${err.message}`);
			}
		}
	}

	for (const dest of splitsDestinations) {
		let record = filterEmptyKeys(getBaseRecord({ satAmount, boostagram, lockedSplit }));
		let amount = Math.round((dest['@_split'] / 100) * runningTotal);
		record.name = dest['@_name'];
		record.value_msat = amount * 1000;
		if (amount >= 1) {
			let customRecords = { 7629169: JSON.stringify(record) };
			if (dest['@_customKey']) {
				customRecords[dest['@_customKey']] = dest['@_customValue'];
			}

			try {
				let record = {
					destination: dest['@_address'],
					amount: amount,
					customRecords: customRecords
				};

				if (wallet === 'albyApi') {
					payments.push(record);
				} else if ((wallet = 'webln')) {
					await webln.keysend(record);
				}
			} catch (err) {
				alert(`error with  ${dest['@_name']}:  ${err.message}`);
			}
		}
	}

	console.log(payments);

	if (wallet === 'albyApi') {
		let res = await fetch(remoteServer + 'api/alby/boost', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify([].concat(payments))
		});

		let data = await res.json();
		console.log(data);
		return data;
	}
}

function normalizeSplits(destinations) {
	let feesDestinations = [];
	let splitsDestinations = [];
	let splitTotal = 0;
	destinations.forEach((v) => {
		if ((!v['@_fee'] || v['@_fee'] === false) && Number(v['@_split'])) {
			splitTotal += Number(v['@_split']);
		}
	});
	destinations.forEach((v) => {
		if (!v['@_fee'] || v['@_fee'] === false) {
			if (Number(v['@_split'])) {
				v['@_split'] = (Number(v['@_split']) / splitTotal) * 100;
			}
			splitsDestinations.push(clone(v));
		} else {
			feesDestinations.push(clone(v));
		}
	});

	return { feesDestinations, splitsDestinations };
}

const getBaseRecord = ({ satAmount, boostagram, lockedSplit }) => {
	let record = {
		podcast: get(playingAlbum)?.title,
		feedID: get(playingAlbum)?.id,
		guid: get(playingAlbum)?.podcastGuid,
		episode_guid:
			get(playingSong)?.guid?.['#text'] ||
			get(playingSong)?.guid ||
			get(playingSong)?.enclosure?.['@_url'],
		episode: get(playingSong)?.title,
		ts: Math.trunc(player.currentTime),
		remote_feed_guid: (lockedSplit || get(currentSplit))?.feedGuid,
		remote_item_guid: (lockedSplit || get(currentSplit))?.itemGuid,
		action: 'boost',
		app_name: 'LN Beats',
		value_msat: 0,
		value_msat_total: satAmount * 1000,
		name: undefined,
		message: boostagram,
		sender_name: get(senderName)
	};
	return record;
};

function filterEmptyKeys(obj) {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		if (value !== null && value !== undefined && value !== '') {
			acc[key] = value;
		}
		return acc;
	}, {});
}
