<script>
	import { onMount } from 'svelte';
	import { posterSwiper } from '$/stores';

	export let showDesktopSwiperFix = false;

	onMount(() => {
		console.log('cool');
		setTimeout(() => {
			$posterSwiper.enabled = false;
		}, 500);
		setTimeout(() => {
			$posterSwiper.enabled = true;
			console.log('beans');
			showDesktopSwiperFix = false;
		}, 3000);
	});
</script>

<div />

<style>
	div {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 99;
		background-color: red;
		backdrop-filter: blur(5px);
	}
</style>
