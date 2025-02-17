import fs from 'fs';
import getAlbumsFromIndex from './getAlbumsFromIndex.js';
import getSongsFromIndex from './getSongsFromIndex.js';
import clone from 'just-clone';

let addMissing = true;
let updateFile = false;

export default async function updateMusicFiles() {
	const dbAlbums = JSON.parse(fs.readFileSync('../src/routes/dbAlbums.json', 'utf8'));
	let updatedAlbums = clone(dbAlbums);
	let indexAlbums = await getAlbumsFromIndex();

	const albumMap = new Map(dbAlbums.albums.map((album) => [album.podcastGuid, album]));
	if (indexAlbums.lastUpdateTime > dbAlbums.lastUpdateTime) {
		const newAlbums = indexAlbums.albums.filter((v) => v.lastUpdateTime > dbAlbums.lastUpdateTime);
		const newCleanedAlbums = await getSongsFromIndex(newAlbums);

		newCleanedAlbums.forEach((v) => {
			albumMap.set(v.podcastGuid, v);
		});

		updatedAlbums = {
			lastUpdateTime: indexAlbums.lastUpdateTime,
			albums: Array.from(albumMap.values())
		};

		updateFile = true;
	}

	if (addMissing) {
		const newAlbums = getUniqueObjects(indexAlbums.albums, dbAlbums.albums);
		const newCleanedAlbums = await getSongsFromIndex(newAlbums);
		const brandNewAlbums = newCleanedAlbums.filter((v) => {
			let oldAlbum = dbAlbums.albums.find((w) => v.id === w.id);
			if (oldAlbum) {
				oldAlbum = v;
				return false;
			}
			return true;
		});

		updatedAlbums.albums = [...brandNewAlbums, ...dbAlbums.albums];
		updateFile = true;
	}

	const duplicateMap = new Map(); // Store all duplicate [title, id, generator] for each podcastGuid

	updatedAlbums.albums.forEach((album) => {
		if (!albumMap.has(album.podcastGuid)) {
			albumMap.set(album.podcastGuid, album);
		} else {
			// If it's a duplicate, track it
			if (!duplicateMap.has(album.podcastGuid)) {
				duplicateMap.set(album.podcastGuid, []);
			}

			// Add both the existing and new album [title, id, generator] pairs
			const existingAlbum = albumMap.get(album.podcastGuid);
			duplicateMap
				.get(album.podcastGuid)
				.push(
					[existingAlbum.title, existingAlbum.id, existingAlbum.generator],
					[album.title, album.id, album.generator]
				);

			// Keep the album with the newest lastUpdateTime
			if (album.lastUpdateTime > existingAlbum.lastUpdateTime) {
				albumMap.set(album.podcastGuid, album);
			}
		}
	});

	// Remove duplicate entries within each array
	duplicateMap.forEach((albums, podcastGuid) => {
		const uniqueAlbums = new Map(
			albums.map(([title, id, generator]) => [id, [title, id, generator]])
		);
		duplicateMap.set(podcastGuid, Array.from(uniqueAlbums.values()));
	});

	// Extract final albums (only latest versions)
	updatedAlbums.albums = Array.from(albumMap.values());

	// Convert duplicateMap to array format
	const duplicateIds = Array.from(duplicateMap.entries()).map(([podcastGuid, albums]) => [
		podcastGuid,
		albums
	]);

	fs.writeFileSync('dupes.json', JSON.stringify(duplicateIds).replace(/\r\n|\r/g, '\n'), 'utf-8');

	console.log(updatedAlbums.albums.length);

	if (updateFile) {
		fs.writeFileSync(
			'../src/routes/dbAlbums.json',
			JSON.stringify(updatedAlbums).replace(/\r\n|\r/g, '\n'),
			'utf-8'
		);
	}
}

function getUniqueObjects(arr1, arr2) {
	const ids1 = new Set(arr1.map((obj) => obj.id));
	const ids2 = new Set(arr2.map((obj) => obj.id));

	return [...arr1.filter((obj) => !ids2.has(obj.id)), ...arr2.filter((obj) => !ids1.has(obj.id))];
}

updateMusicFiles();
