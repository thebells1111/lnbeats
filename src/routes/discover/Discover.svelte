<script>
	import { onMount } from 'svelte';
	import AlbumCard from './AlbumCard.svelte';

	import { discoverList } from '$/stores';
	let albumList = [];

	onMount(async () => {
		if (!$discoverList.length) {
			const res = await fetch(
				`api/queryindex?q=${encodeURIComponent(
					'podcasts/bymedium?medium=music&max=1000&val=lightning'
				)}`
			);
			let data = JSON.parse(await res.json());
			albumList = data.feeds || data.feed || [];
			//this removes 100% Retro Live Feed
			albumList = shuffleArray(albumList.filter(({ id }) => id !== 5718023));
			// const ccRes = await fetch(
			// 	`api/queryindex?q=${encodeURIComponent('podcasts/byfeedid?id=4935828')}`
			// );
			// let ccData = JSON.parse(await ccRes.json());
			// console.log(ccData);
			// albumList = [ccData.feed].concat(albumList);
			$discoverList = albumList;
		}
	});

	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
</script>

<header>
	<h2>Discover</h2>
	<img src="lnbeats-header.png" alt="ln beats logo" />
</header>

<ul>
	{#each $discoverList as album}
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
		width: 150px;
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
