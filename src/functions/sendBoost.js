import { playingAlbum, playingSong, player, senderName, remoteServer } from '$/stores';
import { get } from 'svelte/store';

export default async function sendBoost({ webln, destinations, satAmount, boostagram, wallet }) {
	console.log(destinations);

	let runningTotal = satAmount;

	let payments = [];

	let feesDestinations = [].concat(destinations)?.filter((v) => v.fee) || [];
	let splitsDestinations = [].concat(destinations)?.filter((v) => !v.fee) || [];

	for (const dest of feesDestinations) {
		let feeRecord = getBaseRecord(satAmount, boostagram);

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
		let record = getBaseRecord(satAmount, boostagram);
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
	}
}

const getBaseRecord = (satAmount, boostagram) => {
	return {
		podcast: get(playingAlbum)?.title,
		feedID: get(playingAlbum)?.id,
		itemID: get(playingSong)?.id,
		episode: get(playingSong)?.title,
		ts: Math.trunc(player.currentTime),
		action: 'boost',
		app_name: 'LN Beats',
		value_msat: 0,
		value_msat_total: satAmount * 1000,
		name: undefined,
		message: boostagram,
		sender_name: get(senderName)
	};
};
