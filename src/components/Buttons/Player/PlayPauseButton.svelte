<script>
	import { player, playingSong, hls } from '$/stores';
	import Play from '$icons/PlayArrow.svelte';
	import Pause from '$icons/Pause.svelte';
	export let size = 30;
	export let style;

	function handlePlayButton() {
		if ($player && $player.paused) {
			$player.play();
		} else if ($player && $player.src) {
			$player.pause();
		}
		$player.paused = $player.paused;
	}
</script>

{#if $player}
	<button on:click={handlePlayButton} aria-label="Play Pause" {style}>
		{#if $player.src !== $playingSong?.enclosure?.['@_url'] && $hls?.url !== $playingSong?.enclosure?.['@_url']}
			<Play {size} />
		{:else if $player.paused}
			<Play {size} />
		{:else}
			<Pause {size} />
		{/if}
	</button>
{/if}

<style>
	button {
		border: none;
		padding: 0;
		margin: 0;
		background-color: transparent;
		width: 45px;
		height: 45px;
	}
</style>
