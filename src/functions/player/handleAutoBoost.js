import { get } from 'svelte/store';
import sendBoost from '$functions/sendBoost';

import { satsPerSong, user, webln } from '$/stores';

async function handleAutoBoost(destinations) {
	let $satsPerSong = get(satsPerSong);
	let $user = get(user);
	let $webln = get(webln);

	if ($satsPerSong > 0 && destinations) {
		try {
			sendBoost({
				webln: $webln,
				destinations,
				satAmount: $satsPerSong,
				wallet: $user.preferences.wallet
			});
		} catch (err) {
			
		}
	}
}

export default handleAutoBoost;
