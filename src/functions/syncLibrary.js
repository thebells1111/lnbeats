import { remoteServer } from '$/stores';

export async function saveLibrary(_library) {
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
