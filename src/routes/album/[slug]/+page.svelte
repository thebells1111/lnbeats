<script>
	export let data = {};
	import PlayPauseButton from '$buttons/player/PlayPauseButton.svelte';
	import { selectedAlbum, playingAlbum, player, playingSong, posterSwiper } from '$/stores';
	$selectedAlbum = data.album;
	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';

	function playSong(song) {
		$playingAlbum = $selectedAlbum;
		$playingAlbum.title = $playingAlbum.title;
		$playingAlbum.author = $playingAlbum.author;

		if ($player.src !== song.enclosureUrl) {
			$player.pause();
			$player.src = song.enclosureUrl;
			$playingSong = song;
		}

		$player.play();

		$player.paused = $player.paused;
		openPoster();
	}

	function openPoster() {
		document.getElementById('poster-swiper').style.visibility = 'initial';
		$posterSwiper.slideTo(1);
		// setTimeout(() => $posterSwiper.slideTo(1), 1000);
	}
</script>

<ul>
	<header>
		<img src={$selectedAlbum.image || $selectedAlbum.artwork} />
		<h2>{$selectedAlbum.title}</h2>
	</header>

	<AddToLibraryButton />
	{#each $selectedAlbum.songs as song}
		<li on:click={playSong.bind(this, song)}>
			<p>{song.title}</p>
		</li>
	{/each}
</ul>

<style>
	header {
		display: flex;
	}
	ul {
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		list-style: none;
		justify-content: space-between;
		border-bottom: 1px solid var(--color-text-2);
		padding: 8px;
	}

	p {
		text-align: left;
		width: 100%;
		padding: 0;
		margin: 0;
	}

	img {
		width: 100px;
		height: 100px;
		border-radius: 8px;
		margin: 8px;
	}
</style>
