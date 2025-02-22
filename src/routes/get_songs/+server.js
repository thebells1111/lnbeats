import getSongsFromFeeds from '../../../updateMusicFiles/getSongsFromFeeds.js';

import { remoteServer } from '$/stores';

// ======== SvelteKit POST Route ========
export async function POST({ request }) {
	try {
		const albums = await request.json();
		if (!Array.isArray(albums)) {
			return new Response(JSON.stringify({ error: 'Invalid data format' }), { status: 400 });
		}

		const updatedAlbums = await getSongsFromFeeds(albums, remoteServer);
		return new Response(JSON.stringify(updatedAlbums), { status: 200 });
	} catch (error) {
		console.error('Error processing request:', error);
		return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
	}
}
