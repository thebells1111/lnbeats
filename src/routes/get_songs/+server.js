import axios from 'axios';
import CryptoJS from 'crypto-js';
import cleanAlbums from './cleanAlbums.js';
import { PI_API_KEY, PI_API_SECRET } from '$env/static/private';

// ======== Hash Function for Authorization Token ========
function generateAuthHeaders() {
	const apiHeaderTime = Math.floor(Date.now() / 1000);
	const data4Hash = PI_API_KEY + PI_API_SECRET + apiHeaderTime;
	const hash4Header = CryptoJS.SHA1(data4Hash).toString(CryptoJS.enc.Hex);

	return {
		'X-Auth-Date': apiHeaderTime.toString(),
		'X-Auth-Key': PI_API_KEY,
		Authorization: hash4Header,
		'User-Agent': 'CurioHoster'
	};
}

// ======== Fetch Songs for an Album ========
async function getSongs(album) {
	let attempts = 0;
	const headers = generateAuthHeaders();

	try {
		const url = `https://api.podcastindex.org/api/1.0/episodes/byfeedid?id=${album.id}`;
		const response = await axios.get(url, { headers });

		if (response?.data?.items) {
			album.item = response.data.items;
		}
		return album;
	} catch (err) {
		console.log(err);
	}

	console.error(`Max attempts reached for album ID ${album.id}`);
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
