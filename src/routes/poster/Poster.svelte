<script>
	import { playingSong, playingAlbum, player } from '$/stores';
	import AudioProgressBar from './AudioProgressBar.svelte';
	import Controls from './Controls.svelte';
	import convertTime from '$functions/convertTime.js';
	$: console.log($playingAlbum);
</script>

<poster-container>
	<poster>
		<img
			src={$playingSong.image ||
				$playingSong.artwork ||
				$playingAlbum.image ||
				$playingAlbum.artwork}
		/>
		<h3>{$playingSong.title}</h3>
		<album-info>
			<album-title>{$playingAlbum && $playingAlbum.title}</album-title>
			<band-name>{$playingAlbum.author}</band-name>
		</album-info>
		{#if $player?.src}
			<audio-progress>
				<time-display>
					{#if $player?.duration}
						<p>{convertTime($player.currentTime, $player.duration)}</p>
						<p>{convertTime($player.duration)}</p>
					{/if}
				</time-display>
				<AudioProgressBar />
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
	}
	poster {
		width: calc(100% - 16px);
		height: calc(100% - 32px);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16px 8px 8px 8px;
		border-top: 1px solid black;
		border-radius: 8px 8px 0 0;
		background-color: white;
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

	h3 {
		margin: 8px 0;
	}

	album-info {
		display: flex;
		width: 100%;
		align-items: flex-start;
		justify-content: space-between;
		flex-grow: 1;
	}

	album-title {
		display: block;
		width: 50%;
	}

	band-name {
		display: block;
		width: 50%;
		text-align: right;
	}
</style>
