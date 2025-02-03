<script>
	import { Swiper, SwiperSlide } from 'swiper/svelte';
	import CreatePlaylist from '$c/CreatePlaylist/CreatePlaylist.svelte';
	import Close from '$icons/Close.svelte';

	import { createPlaylistSwiper } from '$/stores';
</script>

<create-playlist id="create-playlist-swiper">
	<Swiper
		direction="vertical"
		autoHeight={true}
		simulateTouch={false}
		on:slideChange={() => {
			if ($createPlaylistSwiper.activeIndex === 0) {
				setTimeout(
					() => (document.getElementById('create-playlist-swiper').style.visibility = 'hidden'),
					500
				);
			}
		}}
		on:swiper={(e) => ($createPlaylistSwiper = e.detail[0])}
	>
		<SwiperSlide><div class="hidden-slide" /></SwiperSlide>
		<SwiperSlide>
			<container>
				<header>
					<button
						on:click={() => {
							$createPlaylistSwiper.slideTo(0);
							setTimeout(() => {
								document.getElementById('create-playlist-swiper').style.visibility = 'hidden';
							}, 500);
						}}
					>
						<Close size={24} />
					</button>
				</header>
				<div>
					<CreatePlaylist />
				</div>
			</container>
		</SwiperSlide>
	</Swiper>
</create-playlist>

<style>
	create-playlist {
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

	header {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	header > button {
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

	container > div {
		width: calc(100% - 8px);
		height: calc(100% - 16px);
		overflow: auto;
	}
</style>
