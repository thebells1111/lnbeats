<script>
	export let data = {};
	import { selectedAlbum, playingAlbum, player, playingSong, posterSwiper } from '$/stores';
	$selectedAlbum = data.album;
	console.log($selectedAlbum);
	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';

	function handlePlaySong(song) {
		$playingAlbum = $selectedAlbum;
		$playingAlbum.title = $playingAlbum.title;
		$playingAlbum.author = $playingAlbum.author;

		if ($player.src !== song.enclosureUrl) {
			$player.pause();
			$player.src = song.enclosureUrl;
			$playingSong = song;
		}
		$player.play();
		// if ($player && $player.paused) {
		// 	$player.play();
		// } else if ($player && $player.src) {
		// 	$player.pause();
		// }
		$player.paused = $player.paused;
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
	}
</script>

<ul>
	<h1>{$selectedAlbum.title}</h1>
	<AddToLibraryButton />
	{#each $selectedAlbum.songs as song}
		<li on:click={handlePlaySong.bind(this, song)}>
			<p>{song.title}</p>
		</li>
	{/each}
</ul>

<style>
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		list-style: none;
		justify-content: space-between;
	}

	h1 {
		margin-top: 0;
	}

	p {
		text-align: left;
		width: 100%;
		margin: 4px;
		margin-left: 8px;
	}
</style>
