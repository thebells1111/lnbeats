<script>
	import PlayPauseButton from '$buttons/player/PlayPauseButton.svelte';
	import PreviousSong from '$buttons/player/PreviousSong.svelte';
	import NextSong from '$buttons/player/NextSong.svelte';
	import Rewind from '$buttons/player/Rewind.svelte';
	import FastForward from '$buttons/player/FastForward.svelte';
</script>

<controls>
	<Rewind size={30} />
	<PreviousSong size={40} />
	<PlayPauseButton size={50} />
	<NextSong size={40} />
	<FastForward size={30} />
</controls>

<style>
	controls {
		display: flex;
		align-items: center;
		justify-content: space-around;
		width: 100%;
		margin-top: 12px;
	}

	spacer {
		display: block;
		width: 45px;
		height: 45px;
	}
</style>
