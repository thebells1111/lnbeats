export async function load({ params }) {
	let playlist = '';
	try {
		playlist = params.playlist;
	} catch (error) {}

	return { guid: playlist };
}
