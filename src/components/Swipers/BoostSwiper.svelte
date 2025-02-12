<script>
	import { Swiper, SwiperSlide } from 'swiper/svelte';
	import BoostScreen from '$c/Wallet/BoostScreen/BoostScreen.svelte';
	import InstructionScreen from '$c/Wallet/BoostScreen/InstructionScreen.svelte';
	import Close from '$icons/Close.svelte';

	import { boostSwiper, showBoostScreen, showInstructionScreen } from '$/stores';
</script>

<boost id="boost-swiper">
	<Swiper
		direction="vertical"
		autoHeight={true}
		simulateTouch={false}
		on:slideChange={() => {
			if ($boostSwiper.activeIndex === 0) {
				setTimeout(() => {
					document.getElementById('boost-swiper').style.visibility = 'hidden';
					$showBoostScreen = false;
					$showInstructionScreen = false;
				}, 333);
			}
		}}
		on:swiper={(e) => ($boostSwiper = e.detail[0])}
	>
		<SwiperSlide><div class="hidden-slide" /></SwiperSlide>
		<SwiperSlide>
			<container>
				<safe-area>
					<header>
						<button
							on:click={() => {
								$boostSwiper.slideTo(0);
							}}
						>
							<Close size={24} />
						</button>
					</header>
					<div>
						{#if $showBoostScreen}
							<BoostScreen />
						{:else if $showInstructionScreen}
							<InstructionScreen />
						{/if}
					</div>
				</safe-area>
			</container>
		</SwiperSlide>
	</Swiper>
</boost>

<style>
	boost {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		visibility: hidden;
		z-index: 100;
	}

	.hidden-slide {
		background-color: transparent;
		height: 100vh;
	}

	container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		align-items: center;
		background-color: var(--color-poster-bg-0);
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 33%,
			var(--color-poster-bg-1) 66%
		);
	}

	safe-area {
		width: calc(100% - 16px);
		height: calc(100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: calc(16px + env(safe-area-inset-top));
		padding-left: calc(8px + env(safe-area-inset-left));
		padding-bottom: calc(8px + env(safe-area-inset-bottom));
		padding-right: calc(8px + env(safe-area-inset-right));

		background-color: var(--color-poster-bg-0);
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 33%,
			var(--color-poster-bg-1) 66%
		);
	}

	header {
		width: 100%;
		height: 36px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	header > button {
		align-self: flex-end;
		margin: 0;
		position: relative;
		padding-right: 16px;
		font-weight: 700;
		color: var(--color-text-0);
		background-color: transparent;
		border: none;
	}

	safe-area > div {
		width: calc(100% - 8px);
		height: calc(100% - 32px);
		overflow: hidden;
		display: flex;
		justify-content: center;
	}
	@media screen and (max-width: 992px) {
	}
</style>
