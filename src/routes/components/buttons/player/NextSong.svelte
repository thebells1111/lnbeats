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
		remoteServer
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
			$player.currentTime = $currentPlayingChapter.startTime;
			$chapterBoostBypass = true;
		} else {
			let album = $playingAlbum;
			let currentSong = $playingSong;
			if (album?.songs && currentSong?.enclosure) {
				if (
					($playingIndex > -1 && $playingIndex < album.songs.length - 1) ||
					($top100Playing && $playingIndex < $top100.length - 1)
				) {
					$playingIndex = $playingIndex + 1;
					let nextSong;
					if ($top100Playing) {
						let _nextSong = $top100[$playingIndex - 1];
						console.log(_nextSong);
						let podcastIndexId = _nextSong.podcastIndexId;
						console.log(podcastIndexId);
						const feedUrl =
							remoteServer +
							`api/queryindex?q=${encodeURIComponent(`/podcasts/byfeedid?id=${podcastIndexId}`)}`;

						try {
							const albumRes = await fetch(feedUrl);
							let albumData = await albumRes.json();
							if (!albumData.status) {
								throw error(404, 'Not found');
							}

							const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
							let data = await res.text();
							console.log(data);

							let xml2Json = parse(data, parserOptions);

							let feed = xml2Json.rss.channel;

							if (feed) {
								if (feed.item?.[0]?.['podcast:episode']) {
									feed.item.sort((a, b) => (a['podcast:episode'] > b['podcast:episode'] ? 1 : -1));
								}

								albumData.feed.songs = [].concat(feed.item);
								albumData.feed.live = data.liveItem ? [].concat(data.liveItem) : undefined;
							}

							$playingAlbum = albumData.feed;
							$playingAlbum.title = $playingAlbum.title;
							$playingAlbum.author = $playingAlbum.author;

							const foundSong = $playingAlbum.songs.find((v) => {
								return v.title == _nextSong.title;
							});

							console.log(foundSong);

							nextSong = foundSong;
						} catch (err) {
							console.log(err);
						}
					} else {
						nextSong = album.songs[$playingIndex];
					}
					loadSong(nextSong);
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
