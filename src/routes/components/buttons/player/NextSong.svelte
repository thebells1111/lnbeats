<script>
	// import gotoNextSong from '$functions/gotoNextSong';
	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';
	import loadSong from '$functions/loadSong';
	import SkipNext from '$icons/SkipNext.svelte';
	export let size = 30;
	export let style;

	import {
		playingAlbum,
		playingSong,
		playingIndex,
		playingChapters,
		currentPlayingChapter,
		currentChapterIndex,
		player,
		chapterBoostBypass,
		top100Playing,
		top100,
		remoteServer,
		lnbRadio,
		lnbRadioPlaying,
		top100Loop,
		favorites,
		favoritesDB,
		remotePlaylistPlaying,
		remotePlaylist,
	} from '$/stores';

	const parserOptions = {
		attributeNamePrefix: '@_',
		//attrNodeName: false,
		//textNodeName : "#text",
		ignoreAttributes: false,
		ignoreNameSpace: false,
		attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
		tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
	};

	async function gotoNextSong() {
		if ($currentChapterIndex < $playingChapters?.length - 1) {
			$currentChapterIndex++;
			$currentPlayingChapter = $playingChapters[$currentChapterIndex];
			while ($currentPlayingChapter.hasOwnProperty('toc') && $currentPlayingChapter.toc !== true) {
				if ($currentChapterIndex < $playingChapters?.length - 1) {
					$currentChapterIndex++;
					$currentPlayingChapter = $playingChapters[$currentChapterIndex];
				}
			}

			console.log($currentPlayingChapter);
			$player.currentTime = $currentPlayingChapter.startTime;
			$chapterBoostBypass = true;
		} else {
			let album = $playingAlbum;
			let currentSong = $playingSong;

			if (
				(album.songs || $lnbRadioPlaying || $remotePlaylistPlaying) &&
				(currentSong?.enclosure || currentSong?.enclosure?.['@_url'])
			) {
				if (
					($playingIndex >= 0 &&
						($playingIndex < album?.songs?.length - 1 ||
							($top100Playing && ($playingIndex - 1 < $top100.length || $top100Loop)) ||
							($lnbRadioPlaying && $playingIndex < $lnbRadio.length - 1) ||
							($remotePlaylistPlaying && $playingIndex < $remotePlaylist.length - 1))) ||
					album.favorites
				) {
					$playingIndex = $playingIndex + 1;
					let nextSong;
					let _nextSong;
					if ($top100Playing || $lnbRadioPlaying || $remotePlaylistPlaying) {
						let feedUrl;
						if ($lnbRadioPlaying) {
							_nextSong = $lnbRadio[$playingIndex];
							console.log(_nextSong);
							feedUrl =
								remoteServer +
								`api/queryindex?q=${encodeURIComponent(
									`podcasts/byguid?guid=${_nextSong.album.podcastGuid}`
								)}`;
						} else if ($top100Playing) {
							if ($playingIndex - 1 === $top100.length) {
								$playingIndex = 1;
							}

							_nextSong = $top100[$playingIndex - 1];
							let feedGuid = _nextSong.feedGuid;
							feedUrl =
								remoteServer +
								`api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${feedGuid}`)}`;
						} else if ($remotePlaylistPlaying) {
							if ($playingIndex === $remotePlaylist.length) {
								$playingIndex = 1;
							}

							_nextSong = $remotePlaylist[$playingIndex];
							let feedGuid = _nextSong['@_feedGuid'];
							feedUrl =
								remoteServer +
								`api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${feedGuid}`)}`;
						}
						console.log(_nextSong);

						try {
							const albumRes = await fetch(feedUrl);
							let albumData = await albumRes.json();
							if (!albumData.status) {
								throw error(404, 'Not found');
							}

							const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
							let data = await res.text();

							let xml2Json = parse(data, parserOptions);

							let feed = xml2Json.rss.channel;
							console.log(feed);
							if (feed) {
								if (feed.item?.[0]?.['podcast:episode']) {
									feed.item.sort((a, b) => (a['podcast:episode'] > b['podcast:episode'] ? 1 : -1));
								} else if (feed.item?.[0]?.['itunes:episode']) {
									feed.item.sort((a, b) => (a['itunes:episode'] > b['itunes:episode'] ? 1 : -1));
								}

								albumData.feed.songs = [].concat(feed.item);
								albumData.feed.live = data.liveItem ? [].concat(data.liveItem) : undefined;
							}

							$playingAlbum = albumData.feed;
							$playingAlbum.title = $playingAlbum.title;
							$playingAlbum.author = $playingAlbum.author;

							console.log($playingAlbum);

							let foundSong;
							if ($lnbRadioPlaying) {
								console.log($playingAlbum.songs);
								foundSong = $playingAlbum.songs.find(
									(v) => JSON.stringify(v.guid) === JSON.stringify(_nextSong.guid)
								);
							} else if ($top100Playing) {
								foundSong = $playingAlbum.songs.find((v) => {
									return v.title == _nextSong.title;
								});
							} else if ($remotePlaylist) {
								foundSong = $playingAlbum.songs.find(
									(v) => v.guid['#text'] == _nextSong['@_itemGuid']
								);
							}

							nextSong = foundSong;
						} catch (err) {
							console.log(err);
						}
					} else if (album.favorites) {
						let favs = Object.entries($favorites);
						let nextIndex = favs.findIndex((v) => v[0] === album.favorites) + 1;
						let song = await favoritesDB.getItem(favs[nextIndex][0]);

						$playingAlbum = {
							album: song.album,
							favorites: favs[nextIndex][0],
							title: song.album.title,
							artwork: song.album.artwork || song.album.image,
							songs: song,
							author: song.album.author,
							podcastGuid: song.album.podcastGuid
						};
						nextSong = song;
					} else {
						nextSong = album.songs[$playingIndex];
					}
					loadSong(nextSong);

					if (nextSong.playlist) {
						$playingAlbum = {
							...$playingAlbum,
							album: nextSong.album,
							title: nextSong.album.title,
							artwork: nextSong.album.artwork || nextSong.album.image,
							author: nextSong.album.author
						};
					}
				}
			}
		}
	}
</script>

<button on:click={gotoNextSong} aria-label="Next Song" {style}>
	<SkipNext {size} />
</button>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		padding: 0;
		margin: 0;
		background-color: transparent;
		width: 45px;
		height: 45px;
	}
</style>
