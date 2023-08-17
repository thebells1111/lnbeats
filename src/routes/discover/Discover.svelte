<script>
	import { onMount } from 'svelte';
	import AlbumCard from './AlbumCard.svelte';
	import SearchBar from './SearchBar.svelte';
	import { remoteServer } from '$/stores';
	import clone from 'just-clone';
	import extras from './extras.json';

	import { discoverList, albumSearch } from '$/stores';
	let albumList = [];
	let filteredList = [];
	let extra = [];
	let wavlake = [];
	let other = [];

	onMount(async () => {
		if (!$discoverList.length) {
			const res = await fetch(
				remoteServer +
					`api/queryindex?q=${encodeURIComponent(
						'podcasts/bymedium?medium=music&max=1000&val=lightning'
					)}`
			);
			let data = await res.json();
			let fetchedFeeds = data.feeds || data.feed || [];
			const resBB = await fetch(
				remoteServer + `api/queryindex?q=${encodeURIComponent('podcasts/byfeedid?id=6562175')}`
			);
			let dataBB = await resBB.json();
			let BBFeed = dataBB.feeds || dataBB.feed || [];
			console.log(BBFeed);

			fetchedFeeds.forEach((v) => {
				let addFeed = true;
				if (
					//this removes 100% Retro Live Feed
					[5718023].find((w) => v.id === w) ||
					v.author === 'Gabe Barrett'
				) {
					addFeed = false;
				}
				if (addFeed && v.generator === 'Wavlake Studio') {
					wavlake.push(v);
				}
				if (addFeed && v.generator !== 'Wavlake Studio') {
					other.push(v);
				}
			});

			// albumList = extras.concat(shuffleArray(other)).concat(shuffleArray(wavlake));
			albumList = shuffleArray(other).concat(shuffleArray(wavlake));

			$discoverList = albumList;
		}

		if ($albumSearch) {
			handleInput({ target: { value: $albumSearch } });
		} else {
			filteredList = clone($discoverList);
		}

		wavlake.sort((a, b) => {
			return a.title.localeCompare(b.title); // Sort by author
		});

		other.sort((a, b) => {
			return a.title.localeCompare(b.title); // Sort by author
		});

		console.log('Wavlake Feeds: ', wavlake);
		console.log('Other Feeds: ', other);
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
		$albumSearch = query;
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
		margin: 8px 0 0 8px;
		flex: 1;
		width: calc(100% - 8px);
		flex-wrap: wrap;
		justify-content: center;
		overflow: auto;
	}

	li {
		list-style: none;
	}
</style>
