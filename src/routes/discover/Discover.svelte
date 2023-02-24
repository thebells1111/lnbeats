<script>
	import { onMount } from 'svelte';
	import AlbumCard from './AlbumCard.svelte';
	let albumList = [];

	onMount(async () => {
		const res = await fetch(`api/queryindex?q=podcasts/bymedium?medium=music`);
		let data = JSON.parse(await res.json());
		albumList = data.feeds || data.feed || [];
		albumList = albumList.filter(({ id }) => id !== 5718023).reverse();
	});
</script>

<header>
	<h2>Discover</h2>
	<img src="/msp-header.png" alt="music side project logo" />
</header>

<ul>
	{#each albumList as album}
		<li>
			<AlbumCard {album} />
		</li>
	{/each}
</ul>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 50px;
		padding: 0 12px;
	}
	img {
		text-align: center;
		width: 60px;
		margin-top: 4px;
	}

	h2 {
		margin: 0;
		font-family: 'Charm', cursive;
		font-weight: 700;
		font-size: 2em;
	}
	ul {
		display: flex;
		padding: 0;
		margin: 8px 0 8px 8px;
		height: calc(100% - 66px);
		width: calc(100% - 8px);
		flex-wrap: wrap;
		justify-content: center;
		overflow: auto;
	}

	li {
		list-style: none;
	}
</style>
