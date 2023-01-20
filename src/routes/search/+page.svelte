<script>
	import { indexSearchResults, selectedAlbum } from '$/stores';
	import { goto } from '$app/navigation';

	async function selectAlbum(album) {
		$selectedAlbum = album;
		let url = `/album/${album.id}`;
		console.log(url);
		goto(url);
	}
</script>

<ul>
	{#each $indexSearchResults as album}
		<li on:click={selectAlbum.bind(this, album)}>{album.title}</li>
	{/each}
</ul>
