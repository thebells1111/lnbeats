import axios from 'axios';
import CryptoJS from 'crypto-js';
import cleanAlbums from './cleanAlbums.js';
import { PI_API_KEY, PI_API_SECRET } from '$env/static/private';

import { remoteServer } from '$/stores';

// ======== Fetch Songs for an Album ========
async function getSongs(album) {
	try {
		const url = remoteServer + `api/queryindex?q=episodes/byfeedid?id=${album.id}`;
		const response = await axios.get(url);

		if (response?.data?.items) {
			album.item = response.data.items;
		}
		return album;
	} catch (err) {
		console.log(err);
	}

	console.error(err);
	return null;
}

// ======== Process Albums and Fetch Songs ========
async function getSongsFromIndex(albums) {
	const albumsWithSongs = await Promise.all(
		albums.map(async (album) => {
			if (!album?.item?.length) {
				return await getSongs(album);
			}
			return album;
		})
	);

	return cleanAlbums(albumsWithSongs.filter(Boolean));
}

// ======== SvelteKit POST Route ========
export async function POST({ request }) {
	try {
		const albums = await request.json();
		if (!Array.isArray(albums)) {
			return new Response(JSON.stringify({ error: 'Invalid data format' }), { status: 400 });
		}

		const updatedAlbums = await getSongsFromIndex(albums);
		return new Response(JSON.stringify(updatedAlbums), { status: 200 });
	} catch (error) {
		console.error('Error processing request:', error);
		return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
	}
}
