<script>
	import { indexSearchResults, selectedAlbum } from '$/stores';

	async function selectAlbum(album) {
		$selectedAlbum = album;
	}
</script>

<ul>
	{#each $indexSearchResults as album}
		<li onclick={selectAlbum.bind(this, album)}>{album.title}</li>
	{/each}
</ul>
