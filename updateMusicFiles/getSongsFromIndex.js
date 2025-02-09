import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import cleanAlbums from './cleanAlbums.js';

if (!process.env.PI_API_KEY) {
	dotenv.config();
}

const { PI_API_KEY, PI_API_SECRET } = process.env;

// ======== Hash them to get the Authorization token ========
const apiHeaderTime = Math.floor(Date.now() / 1000);
const sha1Hash = crypto.createHash('sha1');
const data4Hash = PI_API_KEY + PI_API_SECRET + apiHeaderTime;
sha1Hash.update(data4Hash);
const hash4Header = sha1Hash.digest('hex');
// ======== Construct Axios Request ========
const headers = {
	'X-Auth-Date': apiHeaderTime.toString(),
	'X-Auth-Key': PI_API_KEY,
	Authorization: hash4Header,
	'User-Agent': 'CurioHoster'
};

// Re-authenticate function
async function reAuthenticate() {
	const apiHeaderTime = Math.floor(Date.now() / 1000);
	const sha1Hash = crypto.createHash('sha1');
	const data4Hash = PI_API_KEY + PI_API_SECRET + apiHeaderTime;
	sha1Hash.update(data4Hash);
	const hash4Header = sha1Hash.digest('hex');

	headers.Authorization = hash4Header;
	headers['X-Auth-Date'] = apiHeaderTime.toString();

	console.log('Reauthentication successful.');
}

// Helper function to delay for a specified time (in ms)
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getSongs(album, index) {
	let attempts = 0;
	try {
		const baseUrl = 'https://api.podcastindex.org/api/1.0/';
		const q = `episodes/byfeedid?id=${album.id}`;
		const url = baseUrl + q;

		const response = await axios.get(url, { headers: headers });

		if (response?.data?.items) {
			album.item = [].concat(response.data.items);
		} else {
			album.item = [];
		}
		return album;
	} catch (err) {
		await reAuthenticate();
		attempts++;
		index--;
		if (attempts < 10) {
			await delay(500); // Wait before retrying
		} else {
			console.error(`Max attempts reached for ${album.id}`);
			return null;
		}
	}
}

export default async function getSongsFromIndex(albums) {
	try {
		let length = albums.length;
		let albumsWithSongs = [];
		for (let index = 0; index < length; index++) {
			console.log(`${index} of ${length}`);
			if (!albums?.item?.length) {
				let album = await getSongs(albums[index], index, length);
				albumsWithSongs.push(album);
			}
		}

		let cleanedAlbums = cleanAlbums(albumsWithSongs.filter((v) => v));

		return cleanedAlbums;
	} catch (error) {
		return [];
	}
}
