import localforage from 'localforage';

export async function saveAlbum(album) {
	const albumDB = localforage.createInstance({
		name: 'albumDB'
	});
	albumDB.setItem(album);
}
