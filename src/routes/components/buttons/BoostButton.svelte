<script>
	import RocketLaunch from '$icons/RocketLaunch.svelte';
	import BoostScreen from '../BoostScreen/BoostScreen.svelte';
	import { posterSwiper } from '$/stores';
	import { onMount } from 'svelte';
	let _window;
	let showBoostScreen = false;

	onMount(() => {
		_window = window;
	});
</script>

<button
	on:click={() => {
		if (_window?.webln) {
			showBoostScreen = true;
			$posterSwiper.enabled = false;
		} else {
			alert(
				`You don't have a wallet enabled!!!\r\n\r\nTry using \r\n  Alby ( https://getalby.com/ )\r\n    on the Desktop \r\nor\r\n  Kiwi Browser ( https://kiwibrowser.com/ )\r\n    on your mobile device. Then you can install Alby on Kiwi. \r\n \r\nYou can also install Blue Wallet ( https://bluewallet.io/ ) \r\n or Blixt Wallet ( https://blixtwallet.github.io/ )  \r\n on your mobile device.`
			);
		}
	}}
>
	<RocketLaunch size={35} />
</button>

{#if showBoostScreen}
	<BoostScreen bind:showBoostScreen />
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
