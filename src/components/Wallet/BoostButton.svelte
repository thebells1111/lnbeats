<script>
	import RocketLaunch from '$icons/RocketLaunch.svelte';
	import {
		user,
		webln,
		showBoostScreen,
		showInstructionScreen,
		currentSplitDestinations,
		playingSong,
		playingAlbum,
		currentBoostDestinations,
		boostSwiper
	} from '$/stores';
</script>

<button
	on:click={() => {
		$currentBoostDestinations =
			$currentSplitDestinations ||
			$playingSong?.['podcast:value']?.['podcast:valueRecipient'] ||
			$playingAlbum?.['podcast:value']?.['podcast:valueRecipient'];
		if (
			(($webln && $user.preferences.wallet === 'webln') ||
				$user.preferences.wallet === 'albyApi') &&
			$user.loggedIn
		) {
			$showBoostScreen = true;
			document.getElementById('boost-swiper').style.visibility = 'initial';
			$boostSwiper.slideTo(1);
		} else {
			$boostSwiper.slideTo(0);
			$showInstructionScreen = true;
			document.getElementById('boost-swiper').style.visibility = 'initial';
			$boostSwiper.slideTo(1);
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
