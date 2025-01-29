import sendBoost from '$functions/sendBoost';
import getStores from '$functions/getStores';

import { satsPerSong, user } from '$/stores';

async function handleAutoBoost(destinations) {
	const { $satsPerSong, $user } = getStores({ satsPerSong, user });
	if ($satsPerSong > 0 && destinations) {
		try {
			sendBoost({
				webln: $webln,
				destinations,
				satAmount: $satsPerSong,
				wallet: $user.preferences.wallet
			});
		} catch (err) {
			satsPerSong.set(0);
		}
	}
}

export default handleAutoBoost;
