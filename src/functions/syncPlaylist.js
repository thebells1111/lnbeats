import { remoteServer } from '$/stores';
import { updated } from '$app/stores';

export default async function syncPlaylist(playlist) {
	let res = await fetch(remoteServer + 'api/lnb/saveplaylist', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(playlist)
	});
	let data = await res.json();
	return data;
}
