import { decodeURL } from '$functions/songId';

export async function load({ params }) {
	let playlist = '';
	try {
		playlist = decodeURL(params.playlist);
	} catch (error) {}

	return { playlist };
}
