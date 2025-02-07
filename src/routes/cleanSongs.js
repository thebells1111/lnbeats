import fs from 'fs';

export default async function cleanSongs() {
	const dbAlbums = JSON.parse(fs.readFileSync('dbAlbums.json', 'utf8'));

	const _albums = dbAlbums.albums.map((v) => {
		v.item.forEach((w) => (w.image = w.image || v.image));
		return v;
	});

	dbAlbums.albums = _albums;

	fs.writeFileSync('dbAlbums.json', JSON.stringify(dbAlbums).replace(/\r\n|\r/g, '\n'), 'utf-8');
}

cleanSongs();
