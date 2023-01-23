import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load({ params, fetch }) {
	try {
		let albumUrl = `/api/queryindex?q=${encodeURIComponent(
			`/podcasts/byfeedid?id=${params.slug}`
		)}`;

		const albumRes = await fetch(albumUrl);
		let albumData = await albumRes.json();
		albumData = JSON.parse(albumData);
		if (!albumData.status) {
			throw error(404, 'Not found');
		}

		let url = `/api/queryindex?q=${encodeURIComponent(`/episodes/byfeedid?id=${params.slug}`)}`;

		const res = await fetch(url);
		let data = await res.json();

		data = JSON.parse(data);

		if (data.status) {
			albumData.feed.songs = data.items;
			albumData.feed.live = data.liveItems;
			return { album: albumData.feed };
		}
	} catch (err) {
		console.log(err);
	}
}
