import { remoteServer } from '$/stores';

export default async function syncLibrary(_library) {
	if (_library.delete) {
	} else {
		let res = await fetch(remoteServer + 'api/lnb/savelibrary', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ library: _library })
		});
		let data = await res.json();
		return data;
	}
}
