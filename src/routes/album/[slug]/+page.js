import { error } from '@sveltejs/kit';
import { selectedAlbum } from '$/stores';
import { get } from 'svelte/store';

export async function load({ params, fetch }) {
	try {
		if (!get(selectedAlbum).id) {
			let url = `/api/queryindex?q=${encodeURIComponent(`/podcasts/byfeedid?id=${params.slug}`)}`;

			const res = await fetch(url);
			let data = await res.json();
			data = JSON.parse(data);
			if (data.status) {
				selectedAlbum.set(data.feed);
			} else {
				throw error(404, 'Not found');
			}
		}

		let url = `/api/queryindex?q=${encodeURIComponent(`/episodes/byfeedid?id=${params.slug}`)}`;

		const res = await fetch(url);
		let data = await res.json();

		data = JSON.parse(data);

		if (data.status) {
			return { songs: data.items, live: data.liveItems };
		}
	} catch (err) {
		console.log(err);
	}
}
