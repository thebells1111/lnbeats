<script>
	import { indexSearchResults, selectedAlbum } from '$/stores';
	import { goto } from '$app/navigation';
	import SearchCard from './SearchCard.svelte';

	async function selectAlbum(album) {
		$selectedAlbum = album;
		let url = `/album/${album.id}`;
		console.log(url);
		goto(url);
	}
</script>

<ul>
	{#each $indexSearchResults as album}
		<li on:click={selectAlbum.bind(this, album)}>
			<SearchCard {album} />
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		padding: 0;
		margin: 8px;
		width: calc(100% - 16px);
		flex-wrap: wrap;
		justify-content: space-between;
	}

	li {
		list-style: none;
	}
</style>
