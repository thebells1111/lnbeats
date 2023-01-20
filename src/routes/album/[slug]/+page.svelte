<script>
	export let data = {};
	import { selectedAlbum } from '$/stores';
	$selectedAlbum.songs = data.songs;
	$selectedAlbum.live = data.live;
	console.log($selectedAlbum);
</script>

<ul>
	<h1>{$selectedAlbum.title}</h1>
	{#each $selectedAlbum.songs as song}
		<li>{song.title}</li>
	{/each}
</ul>
