<script>
	import PlaylistAdd from '$icons/PlaylistAdd.svelte';
	import { createPlaylistSwiper } from '$/stores';
</script>

<button
	on:click={() => {
		document.getElementById('create-playlist-swiper').style.visibility = 'initial';
		$createPlaylistSwiper.slideTo(1);
	}}
>
	<PlaylistAdd
		style={'color:var(--color-text-0); filter: drop-shadow(0px 3px 2px rgb(0 0 0 / 0.4))'}
		size={110}
	/>
	<p>Create Playlist</p>
</button>

<style>
	button {
		margin: 0;
		padding: 0;
		border: none;
		background-color: transparent;
		width: 110px;
		height: 65px;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--color-text-0);
		position: relative;
	}

	p {
		color: var(--color-text-0);
		font-size: 0.6em;
		padding: 0;
		margin: 0;
		position: relative;
		left: -4px;
		top: -6px;
	}
</style>
