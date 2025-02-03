<script>
	import { Swiper, SwiperSlide } from 'swiper/svelte';
	import Poster from '$c/Poster/Poster.svelte';

	import { posterSwiper } from '$/stores';
</script>

<poster id="poster-swiper">
	<Swiper
		direction="vertical"
		autoHeight={true}
		simulateTouch={false}
		on:slideChange={() => {
			if ($posterSwiper.activeIndex === 0) {
				setTimeout(
					() => (document.getElementById('poster-swiper').style.visibility = 'hidden'),
					333
				);
			}
		}}
		on:swiper={(e) => ($posterSwiper = e.detail[0])}
	>
		<SwiperSlide><div class="hidden-slide" /></SwiperSlide>
		<SwiperSlide>
			<Poster />
		</SwiperSlide>
	</Swiper>
</poster>

<style>
	poster {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		visibility: hidden;
		z-index: 97;
	}

	poster {
		z-index: 98;
	}

	.hidden-slide {
		background-color: transparent;
		height: 100vh;
	}
</style>
