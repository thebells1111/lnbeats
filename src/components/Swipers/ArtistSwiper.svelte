<script>
	import { Swiper, SwiperSlide } from 'swiper/svelte';
	import AlbumCard from '$c/Discover/AlbumCard.svelte';
	import Close from '$icons/Close.svelte';

	import { artistSwiper, selectedArtist, albumSwiper } from '$/stores';
</script>

<swiper-container id="artist-swiper">
	<Swiper
		direction="vertical"
		autoHeight={true}
		simulateTouch={false}
		on:slideChange={() => {
			if ($artistSwiper.activeIndex === 0) {
				setTimeout(() => {
					document.getElementById('artist-swiper').style.visibility = 'hidden';
				}, 333);
			}
		}}
		on:swiper={(e) => ($artistSwiper = e.detail[0])}
	>
		<SwiperSlide><div class="hidden-slide" /></SwiperSlide>
		<SwiperSlide>
			<container>
				<safe-area>
					<header>
						<button
							on:click={() => {
								$artistSwiper.slideTo(0);
							}}
						>
							<Close size={24} />
						</button>
					</header>
					<div>
						<ul>
							{#each $selectedArtist as artist}
								<li>
									<AlbumCard album={artist} />
								</li>
							{/each}
						</ul>
					</div>
				</safe-area>
			</container>
		</SwiperSlide>
	</Swiper>
</swiper-container>

<style>
	swiper-container {
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

	safe-area > div {
		width: calc(100% - 8px);
		height: calc(100% - 16px);
		overflow: auto;
	}

	ul {
		display: flex;
		padding: 0;
		margin: 8px 0 0 8px;
		flex: 1;
		width: calc(100% - 8px);
		height: calc(100% - 60px);
		flex-wrap: wrap;
		justify-content: center;
		overflow: auto;
	}

	li {
		list-style: none;
	}
</style>
