<script>
	import { parse as parseTranscript } from '@plussub/srt-vtt-parser';
	import { scale } from 'svelte/transition';
	import clone from 'just-clone';
	import { page } from '$app/stores';
	import toUrlFriendly from '$functions/toUrlFriendly';
	import Player from '$c/Player/Player.svelte';

	import AudioProgressBar from './AudioProgressBar.svelte';
	import Controls from './Controls.svelte';
	import BoostButton from '$c/Wallet/BoostButton.svelte';
	import convertTime from '$functions/convertTime.js';
	import Favorite from '$icons/Favorite.svelte';
	import FavoriteFilled from '$icons/FavoriteFilled.svelte';
	import Close from '$icons/Close.svelte';
	import Add from '$icons/Add.svelte';
	import Share from '$icons/Share.svelte';
	import { encodeURL } from '$functions/songId';

	import {
		playingSong,
		playingAlbum,
		player,
		posterSwiper,
		playlistControlsSwiper,
		playlistControls,
		currentPlayingChapter,
		favorites,
		playlistsDB,
		shareInfo,
		currentSplit,
		playingTranscript,
		playingTranscriptText,
		currentTranscriptIndex,
		playlists,
		shareSwiper
	} from '$/stores';

	$: isFavorite =
		$favorites?.remoteSongs?.findIndex((v) => {
			return (
				v['@_feedGuid'] === $playingAlbum.podcastGuid &&
				v['@_itemGuid'] === ($playingSong?.guid?.['#text'] || $playingSong?.guid)
			);
		}) > -1;
	$: if ($playingTranscriptText) {
		const transcript = parseTranscript($playingTranscriptText);
		$playingTranscript = transcript.entries;

		let t = $playingTranscript
			.map((v) => v.text)
			.join(' ')
			.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');

		$playingTranscript.full = t.split('|-|').join(' ');
	} else {
		$playingTranscript = [];
	}

	function toggleFavorite() {
		let albumIndex = $favorites.remoteSongs.findIndex((v) => {
			return (
				v['@_feedGuid'] === $playingAlbum.podcastGuid &&
				v['@_itemGuid'] === ($playingSong?.guid?.['#text'] || $playingSong?.guid)
			);
		});

		console.log(albumIndex);

		if (albumIndex > -1) {
			$favorites.remoteSongs.splice(albumIndex, 1);
			$favorites = $favorites;
		} else {
			$favorites.remoteSongs.push({
				'@_feedGuid': $playingAlbum.podcastGuid,
				'@_itemGuid': $playingSong?.guid?.['#text'] || $playingSong?.guid
			});
		}

		$favorites = $favorites;
		$playlists.favorites = $favorites;
		playlistsDB.setItem('playlists', $playlists);
	}

	function handleShare() {
		let songLink =
			$page.url.origin +
			'/album/' +
			$playingAlbum['podcastGuid'] +
			'/' +
			encodeURL($playingSong.enclosure['@_url']);
		let albumLink = $page.url.origin + '/album/' + $playingAlbum['podcastGuid'];
		$shareInfo = {
			author: $playingAlbum.author,
			song: $playingSong.title,
			album: $playingAlbum.title,
			songLink,
			albumLink
		};
		document.getElementById('share-swiper').style.visibility = 'initial';
		$shareSwiper.slideTo(1);
	}

	$: byline = $currentPlayingChapter
		? $currentSplit?.feedGuid === $playingAlbum?.feedGuid
			? ''
			: $currentSplit?.artist
		: $playingAlbum?.author || '';
</script>

<poster-container>
	<poster>
		<button
			class="close"
			on:click={() => {
				$posterSwiper.slideTo(0);
				setTimeout(() => {
					document.getElementById('poster-swiper').style.visibility = 'hidden';
				}, 500);
			}}
		>
			<Close size={24} />
		</button>

		<album-title>{$playingAlbum && $playingAlbum.title}</album-title>
		<top-buttons>
			<button class="share" on:click={handleShare}>
				<Share size="24" />
				<p>Share</p>
			</button>
			<button
				class="share"
				on:click={() => {
					document.getElementById('playlist-controls-swiper').style.visibility = 'initial';
					$playlistControlsSwiper.slideTo(1);
					$playlistControls = { type: 'add', song: { ...$playingSong, album: $playingAlbum } };
				}}
			>
				<Add size="24" />
				<p>Playlist</p>
			</button>
		</top-buttons>

		<player-card>
			<Player />

			{#if $playingTranscript?.[$currentTranscriptIndex]}
				<div class="cc-container">
					<div class="cc">
						{@html $playingTranscript?.[$currentTranscriptIndex]?.text || ''}
					</div>
				</div>
			{/if}

			<player-stack>

				<player-title>
					<button on:click={toggleFavorite} class="favorite-container">
						{#if isFavorite}
							<filled-container
								style={`${isFavorite ? 'display:initial' : 'display:none'}`}
								class:filled={isFavorite}
								transition:scale|global
							>
								<FavoriteFilled size="40" />
							</filled-container>
						{:else}
							<unfilled-container style={`${isFavorite ? 'display:none' : 'display:initial'}`}>
								<Favorite size="40" />
							</unfilled-container>
						{/if}
					</button>

					<album-info>
						<song-title>
							{$currentPlayingChapter
								? $currentPlayingChapter?.toc === false
									? $currentSplit?.song || ''
									: $currentPlayingChapter.title
								: $playingSong.title}
						</song-title>

						<band-name>
							{#if byline}
								by {byline}
								<!-- <a
									href={`/artist/${toUrlFriendly(byline)}
							`}
								>
									{byline}
								</a> -->
							{/if}
						</band-name>
					</album-info>

					<BoostButton />
				</player-title>

				<player-progress>
					{#if $player?.src}
						<audio-progress>
							<time-display>
								{#if $player?.duration}
									<p>{convertTime($player.currentTime, $player.duration)}</p>
									<p>{convertTime($player.duration)}</p>
								{/if}
							</time-display>
							<AudioProgressBar
								handleColor={'var(--color-progressbar-0)'}
								elapsedColor={'var(--color-progressbar-0)'}
								trackerColor={'var(--color-progressbar-1)'}
							/>
						</audio-progress>
						<Controls />
					{/if}
				</player-progress>
			</player-stack>
		</player-card>

	</poster>
</poster-container>

<style>
	poster-container {
		width: 100%;
		height: calc(100vh);
		height: calc(var(--vh, 1vh) * 100);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		position: relative;
	}
	poster {
		width: calc(100% - 16px);
		height: calc(100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16px 8px 8px 8px;
		padding-top: calc(16px + env(safe-area-inset-top));
		padding-left: calc(8px + env(safe-area-inset-left));
		padding-bottom: calc(8px + env(safe-area-inset-bottom));
		padding-right: calc(8px + env(safe-area-inset-right));

		background-color: var(--color-poster-bg-0);
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 33%,
			var(--color-poster-bg-1) 66%
		);
	}

	.cc-container {
		position: absolute;
		top: 384px;
		width: 100%;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		z-index: 9;
	}

	.cc {
		color: white;
		background-color: rgba(0, 0, 0, 0.75);
		margin: 0 auto;
		display: inline-block;
		padding: 4px 8px;
		text-align: center;
	}

	time-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		position: absolute;
		bottom: -20px;
	}
	img {
		width: calc(100% - 16px);
		border-radius: 8px;
		max-width: 360px;
		max-height: 360px;
		object-fit: contain;
	}

	audio-progress {
		display: flex;
		flex-direction: column;
		width: 100%;
		position: relative;
	}

	album-title {
		display: block;
		margin: 0 8px 8px 8px;
		font-weight: 600;
	}

	below-poster-container {
		display: flex;
		flex-grow: 1;
		justify-content: space-between;
		width: calc(100% - 4px);
		padding-right: 16px;
	}

	album-info {
		display: flex;
		flex-direction: column;
		width: 100%;
		align-items: flex-start;
		margin-left: 44px;
	}

	song-title {
		margin: 8px 0;
		font-size: 1.33em;
		font-weight: 650;
	}

	band-name {
		display: block;
		margin: 0 8px;
	}


	button {
		font-weight: 700;
		color: var(--color-text-0);
		background-color: transparent;
	}

	button.close {
		margin-left: auto;
	}

	button.favorite-container {
		display: flex;
		padding: 4px;
		margin-top: 16px;
	}

	filled-container,
	unfilled-container {
		position: absolute;
	}
	.filled {
		color: rgb(249, 24, 128);
	}

	top-buttons {
		width: 100%;
		max-width: 360px;
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.share {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.share p {
		font-size: 0.8em;
		margin: 0;
		padding: 0;
		line-height: 0.8em;
		bottom: 0;
	}

	player-card {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		align-items: center;
		width: 100%;
		gap: 8px;
	}

	player-stack {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		width: 100%;
	}

	player-title {
		display: flex;
		flex-direction: row;
	}

	player-progress {
		margin-top: auto;
	}

	@media (max-height: 333px) {
		album-title,
		top-buttons,
		button.close {
			display: none;
		}
	}

	@media (max-height: 636px) {
		player-card {
			display: flex;
			flex-direction: row;
			flex-grow: 1;
			align-items: start;
			align-items: center;
			width: 100%;
		}

		.cc-container {
			top: 8px;
		}
	}

	@media (min-width: 722px) {
		poster-container {
			border-radius: 8px;
			height: calc(100vh - 16px);
			height: calc(var(--vh, 1vh) * 100 - 16px);
		}
		poster {
			border-radius: 8px;
		}
		.cc-container {
			top: 416px;
		}
	}
</style>
