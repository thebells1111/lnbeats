<script>
	import RocketLaunch from '$icons/RocketLaunch.svelte';
	import BoostScreen from '../BoostScreen/BoostScreen.svelte';
	import InstructionScreen from '../BoostScreen/InstructionScreen.svelte';
	import { posterSwiper, user } from '$/stores';
	import { onMount } from 'svelte';
	let showBoostScreen = false;
	let showInstructionScreen = false;
</script>

<button
	on:click={() => {
		if (
			(window?.webln && $user.preferences.wallet === 'webln') ||
			($user.loggedIn && $user.preferences.wallet === 'albyApi')
		) {
			showBoostScreen = true;
			$posterSwiper.enabled = false;
		} else {
			showInstructionScreen = true;
			$posterSwiper.enabled = false;
		}
	}}
>
	<RocketLaunch size={35} />
</button>

{#if showBoostScreen}
	<BoostScreen bind:showBoostScreen />
{:else if showInstructionScreen}
	<InstructionScreen bind:showInstructionScreen />
{/if}

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		padding: 0;
		margin: 8px 0 0 0;
		background-color: var(--color-bg-boost-button);
		color: var(--color-text-boost-button);
		width: 60px;
		height: 60px;
		border-radius: 50px;
		flex-shrink: 0;
	}
</style>
