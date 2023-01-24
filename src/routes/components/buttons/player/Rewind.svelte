<script>
	import { player } from '$/stores';
	import PreviousSongIcon from '$icons/PreviousSong.svelte';
	export let size = 30;
	let rewindInterval;

	function seekBackwards(event) {
		event.preventDefault();
		$player.currentTime = $player.currentTime - 2;
		rewindInterval = setInterval(() => {
			$player.currentTime = $player.currentTime - 2;
		}, 225);
	}

	function stopSeekBackwards() {
		clearInterval(rewindInterval);
		$player.playbackRate = 1;
	}
</script>

<button
	on:mousedown={seekBackwards}
	on:mouseup={stopSeekBackwards}
	on:touchstart={seekBackwards}
	on:touchend={stopSeekBackwards}
	aria-label="Rewind"
>
	<PreviousSongIcon {size} />
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
