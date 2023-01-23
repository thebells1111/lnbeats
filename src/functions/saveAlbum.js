import localforage from 'localforage';

export async function saveAlbum(album) {
	console.log(album);
	const albumDB = localforage.createInstance({
		name: 'albumDB'
	});
	const libraryDB = localforage.createInstance({
		name: 'libraryDB'
	});
	albumDB.setItem(album.id.toString(), album);

	let library = (await libraryDB.getItem('library')) || {};

	library[album.id] = {
		title: album.title,
		art: album.image || album.artwork,
		url: album.url,
		lastUpdateTime: album.lastUpdateTime
	};

	console.log(library);

	libraryDB.setItem('library', library);
}
