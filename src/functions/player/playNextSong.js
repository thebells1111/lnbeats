import { get } from 'svelte/store';
import loadSong from '$functions/loadSong';
import parseFeed from '$functions/parseFeed';

import {
	playingAlbum,
	playingSong,
	playingIndex,
	remoteServer,
	remotePlaylistPlaying,
	remotePlaylist,
	playingSongList
} from '$/stores';

async function playNextSong() {
	let $playingSong = get(playingSong);
	let $playingAlbum = get(playingAlbum);
	let $playingIndex = get(playingIndex);
	let $remotePlaylistPlaying = get(remotePlaylistPlaying);
	let $remotePlaylist = get(remotePlaylist);
	let $playingSongList = get(playingSongList);

	const album = $playingAlbum ?? {};
	const currentSong = $playingSong ?? {};

	if (currentSong?.enclosure || currentSong?.enclosure?.['@_url']) {
		if (
			$playingIndex >= 0 &&
			($playingIndex < $playingSongList?.length - 1 ||
				($remotePlaylistPlaying && $playingIndex < $remotePlaylist?.remoteSongs?.length - 1))
		) {
			$playingIndex++;
			playingIndex.set($playingIndex);
			let nextSong;
			let _nextSong;
			if ($remotePlaylistPlaying) {
				if ($playingIndex === $remotePlaylist?.remoteSongs?.length) {
					$playingIndex = 1;
				}

				_nextSong = $remotePlaylist?.remoteSongs?.[$playingIndex];
				let feedGuid = _nextSong['@_feedGuid'];
				let feedUrl =
					remoteServer +
					`api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${feedGuid}`)}`;

				try {
					const albumRes = await fetch(feedUrl);
					let albumData = await albumRes.json();
					if (!albumData.status) {
						throw error(404, 'Not found');
					}

					const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
					let data = await res.text();

					let xml2Json = parseFeed(data);

					let feed = xml2Json.rss.channel;
					if (feed) {
						if (feed.item?.[0]?.['podcast:episode']) {
							feed.item.sort((a, b) => (a['podcast:episode'] > b['podcast:episode'] ? 1 : -1));
						} else if (feed.item?.[0]?.['itunes:episode']) {
							feed.item.sort((a, b) => (a['itunes:episode'] > b['itunes:episode'] ? 1 : -1));
						}

						albumData.feed.songs = [].concat(feed.item);
						albumData.feed.live = data.liveItem ? [].concat(data.liveItem) : undefined;
					}

					playingAlbum.set(albumData.feed);

					let foundSong = albumData.feed.songs.find((v) => {
						return v.guid['#text'] == _nextSong['@_itemGuid'];
					});

					nextSong = foundSong;
				} catch (err) {
					console.log(err);
				}
			} else {
				nextSong = $playingSongList?.[$playingIndex];
			}
			loadSong(nextSong);
		}
	}
}

export default playNextSong;
