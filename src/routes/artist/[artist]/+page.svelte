<script>
	import { discoverList, posterSwiper } from '$/stores';
	import { browser } from '$app/environment';
	import AlbumCard from '$routes/discover/AlbumCard.svelte';
	import toUrlFriendly from '$functions/toUrlFriendly';
	import { page } from '$app/stores';

	$: console.log($page.params.artist);

	let albumList = [];

	loadAlbumList();

	$: if ($page.params.artist) {
		loadAlbumList();
	}

	function loadAlbumList() {
		if (browser) {
			if ($discoverList.length) {
				albumList = $discoverList.filter((v) => toUrlFriendly(v.author) === $page.params.artist);
				console.log(albumList);
				$posterSwiper.slideTo(0);
				setTimeout(() => {
					document.getElementById('poster-swiper').style.visibility = 'hidden';
				}, 500);
			} else {
				setTimeout(loadAlbumList, 100);
			}
		}
	}
</script>

<h2>{albumList[0]?.author || ''}</h2>
<ul>
	{#each albumList as album}
		<li>
			<AlbumCard {album} />
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		padding: 0;
		margin: 8px 0 0 8px;
		flex: 1;
		width: calc(100% - 8px);
		flex-wrap: wrap;
		justify-content: center;
		overflow: auto;
	}

	li {
		list-style: none;
	}
</style>
