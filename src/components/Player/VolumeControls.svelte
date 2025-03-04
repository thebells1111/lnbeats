<script>
	import SpeakerHigh from '$icons/SpeakerHigh.svelte';
	import SpeakerMed from '$icons/SpeakerMed.svelte';
	import SpeakerLow from '$icons/SpeakerLow.svelte';
	import SpeakerOff from '$icons/SpeakerOff.svelte';

	import {
		player,
		playerVolume,
		playerMuted,
		previousVolume
	} from '$/stores';

	export let size = 250;

	function toggleMute() {
		if ($playerMuted) {
			$playerMuted = false;
			$playerVolume = $previousVolume;
		}
		else {
			$previousVolume = $playerVolume;
			$playerMuted = true;
		}
	}

	function handleVolumeChange(e) {
		$playerVolume = parseFloat(e.target.value);

		if ($playerVolume > 0 && $playerMuted) {
			$playerMuted = false;
		}
		else if ($playerVolume === 0) {
			$playerMuted = true;
		}
	}

	function getVolumeIcon() {
		if ($playerMuted || $playerVolume === 0) {
			return SpeakerOff;
		}
		else if ($playerVolume < 0.33) {
			return SpeakerLow;
		}
		else if ($playerVolume < 0.66) {
			return SpeakerMed;
		}
		else {
			return SpeakerHigh;
		}
	}
</script>

<container on:click|stopPropagation style="--volume-slider-size: {size}px">
	<button class="volume-button" on:click={toggleMute}>
		<svelte:component this={getVolumeIcon()} size="24" color="currentColor" />
	</button>
	<input
		type="range"
		min="0"
		max="1"
		step="0.01"
		class="volume-slider"
		value={$playerVolume}
		on:input={handleVolumeChange}
	/>
</container>

<style>
	container {
		display: flex;
		align-items: center;
	}

	button:focus-visible {
		outline: none;
	}

	.volume-button {
		background-color: transparent;
		color: var(--color-player-icon-0);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		min-width: 36px;
		height: 36px;
		padding: 0;
		border-radius: 48px;
	}

	.volume-slider {
		width: var(--volume-slider-size);
		height: 4px;
		-webkit-appearance: none;
		background: var(--color-text-1);
		outline: none;
		border-radius: 2px;
		transition: opacity 0.2s;
	}

	.volume-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-player-icon-0);
		cursor: pointer;
	}

	.volume-slider::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-player-icon-0);
		cursor: pointer;
	}

</style>
