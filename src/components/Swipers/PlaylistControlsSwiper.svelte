<script>
	import Close from '$icons/Close.svelte';

	import { Swiper, SwiperSlide } from 'swiper/svelte';

	import AddSongToPlaylist from '$c/CreatePlaylist/AddSongToPlaylist.svelte';
	import RemovalConfirmation from '$c/Library/RemovalConfirmation.svelte';

	import { playlistControlsSwiper, playlistControls } from '$/stores';
</script>

<playlist-controls id="playlist-controls-swiper">
	<Swiper
		direction="vertical"
		autoHeight={true}
		simulateTouch={false}
		on:slideChange={() => {
			if ($playlistControlsSwiper.activeIndex === 0) {
				setTimeout(
					() => (document.getElementById('playlist-controls-swiper').style.visibility = 'hidden'),
					333
				);
			}
		}}
		on:swiper={(e) => ($playlistControlsSwiper = e.detail[0])}
	>
		<SwiperSlide><div class="hidden-slide" /></SwiperSlide>
		<SwiperSlide>
			<container>
				<safe-area>
					<button
						on:click={() => {
							$playlistControlsSwiper.slideTo(0);
						}}
					>
						<Close size={24} />
					</button>
					{#if $playlistControls.type === 'add'}
						<AddSongToPlaylist />
					{:else if $playlistControls.type === 'remove'}
						<RemovalConfirmation />
					{/if}
				</safe-area>
			</container>
		</SwiperSlide>
	</Swiper>
</playlist-controls>

<style>
	playlist-controls {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		visibility: hidden;
		z-index: 99;
	}

	.hidden-slide {
		background-color: transparent;
		height: 100vh;
	}

	container {
		min-width: calc(100% - 16px);
		height: calc(var(--vh, 1vh) * 100 - 32px);
		display: flex;
		flex-direction: column;
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 16px 8px 8px 8px;
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
	safe-area > button {
		align-self: flex-end;
		margin: 0;
		position: relative;
		bottom: 8px;
		padding-right: 8px;
		font-weight: 700;
		color: var(--color-text-0);
		background-color: transparent;
		border: none;
	}
</style>
