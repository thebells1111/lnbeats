import fs from 'fs';
import getAlbumsFromIndex from './getAlbumsFromIndex.js';
import getSongsFromIndex from './getSongsFromIndex.js';

export default async function updateMusicFiles() {
	let indexAlbums = await getAlbumsFromIndex();

	const dbAlbums = JSON.parse(fs.readFileSync('../src/routes/dbAlbums.json', 'utf8'));
	console.log(indexAlbums.lastUpdateTime > dbAlbums.lastUpdateTime);
	if (indexAlbums.lastUpdateTime > dbAlbums.lastUpdateTime) {
		const newAlbums = indexAlbums.albums.filter((v) => v.lastUpdateTime > dbAlbums.lastUpdateTime);
		const newCleanedAlbums = await getSongsFromIndex(newAlbums);
		const brandNewAlbums = newCleanedAlbums.filter((v) => {
			let oldAlbum = dbAlbums.albums.find((w) => v.id === w.id);
			if (oldAlbum) {
				oldAlbum = v;
				return false;
			}
			return true;
		});

		let updatedAlbums = {
			lastUpdateTime: indexAlbums.lastUpdateTime,
			albums: [...brandNewAlbums, ...dbAlbums.albums]
		};

		console.log(updatedAlbums.albums.length);

		fs.writeFileSync(
			'../src/routes/dbAlbums.json',
			JSON.stringify(updatedAlbums).replace(/\r\n|\r/g, '\n'),
			'utf-8'
		);
	}
}

updateMusicFiles();
