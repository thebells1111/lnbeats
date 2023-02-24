<script>
	export let data = {};
	import {
		selectedAlbum,
		playingAlbum,
		player,
		playingSong,
		posterSwiper,
		library
	} from '$/stores';
	$selectedAlbum = data.album;
	import AddToLibraryButton from '$buttons/AddToLibraryButton.svelte';

	$: console.log($library);
	$: console.log($selectedAlbum);

	function playSong(song) {
		$playingAlbum = $selectedAlbum;
		$playingAlbum.title = $playingAlbum.title;
		$playingAlbum.author = $playingAlbum.author;

		if ($player.src !== song.enclosure['@_url']) {
			$player.pause();
			$player.src = song.enclosure['@_url'];
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

<svelte:head>
	{#if $selectedAlbum}
		<meta name="description" content={`${$selectedAlbum.author} - ${$selectedAlbum.title}`} />
		<meta property="og:site_name" content="Music Side Project" />
		<meta property="og:title" content={`${$selectedAlbum.author} - ${$selectedAlbum.title}`} />
		<meta property="og:description" content="Listen on Music Side Project" />
		<meta property="og:image" content={$selectedAlbum.artwork || $selectedAlbum.image} />
		<meta property="og:url" content={`https://musicsideproject.com/album/${$selectedAlbum.id}`} />

		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:title" content={`${$selectedAlbum.author} - ${$selectedAlbum.title}`} />
		<meta property="twitter:description" content="Listen on Music Side Project" />
		<meta property="twitter:image" content={$selectedAlbum.artwork || $selectedAlbum.image} />
		<meta
			property="twitter:url"
			content={`https://musicsideproject.com/album/${$selectedAlbum.id}`}
		/>
	{/if}
</svelte:head>

<ul>
	<header>
		<img src={$selectedAlbum.image || $selectedAlbum.artwork} />
		<h2>{$selectedAlbum.title}</h2>
		{#if !$library[$selectedAlbum.id]}
			<AddToLibraryButton />
		{/if}
	</header>

	{#each $selectedAlbum.songs as song}
		<li on:click={playSong.bind(this, song)}>
			<p>{song.title}</p>
		</li>
	{/each}
</ul>

<style>
	header {
		display: flex;
		position: relative;
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

	h1 {
		margin-top: 0;
	}

	p {
		text-align: left;
		width: 100%;
		margin: 4px;
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
