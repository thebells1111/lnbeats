<script>
	import RocketLaunch from '$icons/RocketLaunch.svelte';
	import {
		posterSwiper,
		user,
		webln,
		showBoostScreen,
		showInstructionScreen,
		currentSplitDestinations,
		playingSong,
		playingAlbum,
		currentBoostDestinations
	} from '$/stores';
</script>

<button
	on:click={() => {
		$currentBoostDestinations =
			$currentSplitDestinations ||
			$playingSong?.['podcast:value']?.['podcast:valueRecipient'] ||
			$playingAlbum?.['podcast:value']?.['podcast:valueRecipient'];
		if (
			($webln && $user.preferences.wallet === 'webln') ||
			$user.preferences.wallet === 'albyApi'
		) {
			$showBoostScreen = true;
			$posterSwiper.enabled = false;
		} else {
			$showInstructionScreen = true;
			$posterSwiper.enabled = false;
		}
	}}
>
	<RocketLaunch size={35} />
</button>

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
