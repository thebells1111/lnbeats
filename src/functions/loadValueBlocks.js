async function loadValueBlocks(album) {
	if (album.promise) {
		let feed = await album.promise;
		delete album.promise;
		if (feed['podcast:value']) {
			album['podcast:value'] = feed['podcast:value'];
		}
		album.songs.forEach((v) => {
			let song = [].concat(feed.item || []).find((w) => v.guid === w.guid?.['#text'] || w.guid);

			if (song['podcast:value']) {
				v['podcast:value'] = song['podcast:value'];
			}
		});
	}
}

export default loadValueBlocks;
