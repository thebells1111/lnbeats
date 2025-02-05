<script>
	import loadAlbum from '$functions/loadAlbum';

	import { albumSwiper, selectedAlbum, isPlaylist } from '$/stores';

	export let album = {};
	export let playlist = false;
	console.log(album);

	async function openAlbum() {
		document.getElementById('album-swiper').style.visibility = 'initial';
		$albumSwiper.slideTo(1);
		$selectedAlbum = album;
		console.log(playlist);
		$isPlaylist = playlist;
		if (!album?.remoteSongs) {
			setTimeout(async () => ($selectedAlbum = await loadAlbum(album.podcastGuid, album)), 1);
		}
	}
</script>

<button on:click={openAlbum}>
	<img src={album.artwork} />

	<album-info>
		<p>{album.title || 'Favorites'}</p>
	</album-info>
</button>

<style>
	button {
		display: flex;
		align-items: center;
		width: 100%;
		background-color: transparent;
		color: var(--color-text-0);
	}
	img,
	queue-icon {
		min-width: 60px;
		max-width: 60px;
		max-height: 60px;
		min-height: 60px;
		margin-right: 8px;
		border-radius: 4px;
	}

	queue-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-poster-bg-0);
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 33%,
			var(--color-poster-bg-1) 66%
		);
	}

	.favorites {
		color: rgb(249, 24, 128);
	}
</style>
