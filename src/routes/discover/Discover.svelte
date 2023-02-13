<script>
	import { onMount } from 'svelte';
	import AlbumCard from './AlbumCard.svelte';
	let albumList = [];

	onMount(async () => {
		const res = await fetch(`api/queryindex?q=podcasts/bymedium?medium=music`);
		let data = JSON.parse(await res.json());
		console.log(data.feeds);
		albumList = data.feeds || data.feed || [];
		albumList = albumList.filter(({ id }) => id !== 5718023).reverse();
	});
</script>

<h1>Music Side Project</h1>

<h2>Discover</h2>

<ul>
	{#each albumList as album}
		<li>
			<a href={`/album/${album.id}`}>
				<AlbumCard {album} />
			</a>
		</li>
	{/each}
</ul>

<style>
	h1 {
		margin-top: 8px;
		text-align: center;
	}

	h2 {
		margin: 8px 8px 0 8px;
	}
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
