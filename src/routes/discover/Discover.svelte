<script>
	import { onMount } from 'svelte';
	import AlbumCard from './AlbumCard.svelte';
	import SearchBar from '../main/NavHeader/SearchBar.svelte';
	import { remoteServer } from '$/stores';
	import clone from 'just-clone';

	import { discoverList } from '$/stores';
	let albumList = [];
	let filteredList = [];

	onMount(async () => {
		if (!$discoverList.length) {
			const res = await fetch(
				remoteServer +
					`api/queryindex?q=${encodeURIComponent(
						'podcasts/bymedium?medium=music&max=1000&val=lightning'
					)}`
			);
			let data = await res.json();
			albumList = data.feeds || data.feed || [];
			//this removes 100% Retro Live Feed
			albumList = shuffleArray(albumList.filter(({ id }) => id !== 5718023));
			// const ccRes = await fetch(
			// 	`api/queryindex?q=${encodeURIComponent('podcasts/byfeedid?id=4935828')}`
			// );
			// let ccData = await ccRes.json();
			// console.log(ccData);
			// albumList = [ccData.feed].concat(albumList);
			$discoverList = albumList;
		}
		filteredList = clone($discoverList);
		console.log(filteredList);
	});

	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	function handleSearch() {}

	function handleInput(e) {
		const query = e.target.value.toLowerCase();
		if (query) {
			filteredList = $discoverList
				.filter(
					(v) => v.author.toLowerCase().includes(query) || v.title.toLowerCase().includes(query)
				)
				.sort((a, b) => a.author.localeCompare(b.author) || a.title.localeCompare(b.title));
		} else filteredList = $discoverList;
	}
</script>

<header>
	<h2>Discover</h2>
	<img src="lnbeats-header.png" alt="ln beats logo" />
</header>

<search-header>
	<SearchBar placeholder="search for album" searchFn={handleSearch} inputFn={handleInput} />
</search-header>

<ul>
	{#each filteredList as album}
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

	search-header {
		min-height: 50px;
		max-height: 50px;
		display: flex;
		align-items: center;
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
		height: calc(100% - 89px);
		width: calc(100% - 8px);
		flex-wrap: wrap;
		justify-content: center;
		overflow: auto;
	}

	li {
		list-style: none;
	}
</style>
