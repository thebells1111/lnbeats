import loadAlbum from '$functions/loadAlbum';

export async function load({ params }) {
	return await loadAlbum(params.albumId);
}
