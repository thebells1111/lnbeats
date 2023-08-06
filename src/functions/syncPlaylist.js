import { remoteServer } from '$/stores';

export default async function syncPlaylist(playlist) {
	if (playlist.delete) {
	} else {
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
}
