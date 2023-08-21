<script>
	import { scale } from 'svelte/transition';
	import {
		playingSong,
		playingAlbum,
		player,
		posterSwiper,
		currentPlayingChapter,
		playingChapters,
		favorites
	} from '$/stores';
	import AudioProgressBar from './AudioProgressBar.svelte';
	import Controls from './Controls.svelte';
	import BoostButton from '$buttons/BoostButton.svelte';
	import convertTime from '$functions/convertTime.js';
	import Favorite from '$icons/Favorite.svelte';
	import FavoriteFilled from '$icons/FavoriteFilled.svelte';
	import Close from '$icons/Close.svelte';
	$: isFavorite = $favorites.has(
		`${$playingAlbum.podcastGuid}||${$playingSong.guid || $playingSong.enclosure['@_url']}`
	);

	console.l;

	function toggleFavorite() {
		console.log($favorites);
		console.log($playingSong);
		if (
			$favorites.has(
				`${$playingAlbum.podcastGuid}||${$playingSong.guid || $playingSong.enclosure['@_url']}`
			)
		) {
			$favorites.delete(
				`${$playingAlbum.podcastGuid}||${$playingSong.guid || $playingSong.enclosure['@_url']}`
			);
		} else {
			$favorites.add(
				`${$playingAlbum.podcastGuid}||${$playingSong.guid || $playingSong.enclosure['@_url']}`
			);
		}
		$favorites = $favorites;
	}

	$: console.log($playingAlbum);
	$: console.log($playingChapters);
	// $: console.log($currentPlayingChapter);
</script>

<poster-container>
	<poster>
		<button
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
		<!-- <button on:click >Share</button> -->
		<img
			id="poster-image"
			src={$currentPlayingChapter?.img ||
				$playingSong.image ||
				$playingSong.artwork ||
				$playingSong?.['itunes:image']?.['@_href'] ||
				$playingAlbum.image ||
				$playingAlbum.artwork ||
				$playingAlbum?.['itunes:image']?.['@_href']}
		/>

		<below-poster-container>
			<button on:click={toggleFavorite} class="favorite-container">
				{#if isFavorite}
					<filled-container
						style={`${isFavorite ? 'display:initial' : 'display:none'}`}
						class:filled={isFavorite}
						transition:scale
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
				<song-title
					>{$currentPlayingChapter
						? $currentPlayingChapter.title || ''
						: $playingSong.title}</song-title
				>
				<band-name>{$currentPlayingChapter ? '' : $playingAlbum.author}</band-name>
			</album-info>

			<BoostButton />
		</below-poster-container>
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

	@media (min-width: 722px) {
		poster-container {
			border-radius: 8px;
			height: calc(100vh - 16px);
			height: calc(var(--vh, 1vh) * 100 - 16px);
		}
		poster {
			border-radius: 8px;
		}
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
		align-self: flex-start;
		margin: 0;
		position: relative;
		bottom: 8px;
		font-weight: 700;
		color: var(--color-text-0);
		background-color: transparent;
		border: none;
		padding: 0;
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
</style>
