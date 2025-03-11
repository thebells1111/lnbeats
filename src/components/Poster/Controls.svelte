<script>
	import PlayPauseButton from '$buttons/Player/PlayPauseButton.svelte';
	import PreviousSong from '$buttons/Player/PreviousSong.svelte';
	import NextSong from '$buttons/Player/NextSong.svelte';
	import Rewind from '$buttons/Player/Rewind.svelte';
	import FastForward from '$buttons/Player/FastForward.svelte';
	import VolumeControls from '$c/Player/VolumeControls.svelte';

	let style = 'color:var(--color-player-icon-0)';
</script>

<controls>
	<Rewind size={30} {style} />
	<PreviousSong size={40} {style} />
	<PlayPauseButton size={50} {style} />
	<NextSong size={40} {style} />
	<FastForward size={30} {style} />
</controls>

<volume-controls>
	<VolumeControls size={250}/>
</volume-controls>

<style>
	controls {
		display: flex;
		align-items: center;
		justify-content: space-around;
		width: 100%;
		margin-top: 12px;
	}

	volume-controls {
		margin-top: 16px;
		display: flex;
		align-items: center;
		justify-content: space-around;
	}

	spacer {
		display: block;
		width: 45px;
		height: 45px;
	}
</style>
