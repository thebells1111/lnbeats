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

{#if _window?.webln}
	<button
		on:click={() => {
			showBoostScreen = true;
			$posterSwiper.enabled = false;
		}}
	>
		<RocketLaunch size={35} />
	</button>
{:else}
	Alby
{/if}

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
		background-color: pink;
		color: var(--color-boost-icon-0);
		width: 60px;
		height: 60px;
		border-radius: 50px;
		flex-shrink: 0;
	}
</style>
