<script>
	import { playingSong, playingAlbum, player, posterSwiper } from '$/stores';
	import AudioProgressBar from './AudioProgressBar.svelte';
	import Controls from './Controls.svelte';
	import BoostButton from '$buttons/BoostButton.svelte';
	import convertTime from '$functions/convertTime.js';
	import Close from '$icons/Close.svelte';
	$: console.log($playingAlbum);
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
		<img
			src={$playingSong.image ||
				$playingSong.artwork ||
				$playingAlbum.image ||
				$playingAlbum.artwork}
		/>

		<below-poster-container>
			<album-info>
				<song-title>{$playingSong.title}</song-title>
				<band-name>{$playingAlbum.author}</band-name>
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
		height: 100vh;
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
		background-color: var(--color-poster-bg-0);
		background-size: 100vw 100vh;
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 33%,
			var(--color-poster-bg-1) 66%
		);
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
		width: 100%;
	}

	album-info {
		display: flex;
		flex-direction: column;
		width: 100%;
		align-items: flex-start;
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
</style>
