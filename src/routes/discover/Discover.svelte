<script>
	import { onMount } from 'svelte';
	import AlbumCard from './AlbumCard.svelte';
	import SearchBar from './SearchBar.svelte';
	import clone from 'just-clone';
	import extras from './extras.json';
	import _featured from './featured.json';
	import Top100 from '$routes/top100/+page.svelte';

	import {
		discoverList,
		featuredList,
		discoverScreen,
		albumSearch,
		remoteServer,
		playingSong,
		radio
	} from '$/stores';
	let albumList = [];
	let filteredList = [];
	let wavlake = [];
	let other = [];
	onMount(async () => {
		if (!$discoverList.length) {
			$radio = shuffleArray(extras);
			$featuredList = shuffleArray(_featured);
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

			albumList = shuffleArray(other).concat(shuffleArray(wavlake));
			// albumList = shuffleArray(other).concat(shuffleArray(wavlake));

			$discoverList = albumList;

			wavlake.sort((a, b) => {
				return a.title.localeCompare(b.title); // Sort by author
			});

			other.sort((a, b) => {
				return a.title.localeCompare(b.title); // Sort by author
			});

			// let featured = [];
			// for (let i = 0; i < other.length; i++) {
			// 	const res = await fetch(remoteServer + `api/proxy?url=${other[i].originalUrl}`);
			// 	let data = await res.text();
			// 	if (data.includes('eChoVKtO1KujpAA5HCoB') || data.includes('UzrnTK2oEHR55gw7Djmb')) {
			// 		featured.push(other[i]);
			// 	}
			// }

			// console.log('Featured: ', featured);

			console.log('Wavlake Feeds: ', wavlake);
			console.log('Other Feeds: ', other);
		}

		if ($albumSearch) {
			handleInput({ target: { value: $albumSearch } });
		} else {
			filteredList = clone($discoverList);
		}
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

<navbar>
	<button
		on:click={() => {
			$discoverScreen = 'featured';
		}}
		class:active={$discoverScreen === 'featured'}>Featured</button
	>
	<button
		on:click={() => {
			$discoverScreen = 'top100';
		}}
		class:active={$discoverScreen === 'top100'}>Top 100</button
	>
	<button
		on:click={() => {
			$discoverScreen = 'radio';
		}}
		class:active={$discoverScreen === 'radio'}>Radio</button
	>
	<button
		on:click={() => {
			$discoverScreen = 'search';
		}}
		class:active={$discoverScreen === 'search'}>Search</button
	>
</navbar>
{#if $discoverScreen === 'featured'}
	<h3>Support These Artist Who Support LNBeats</h3>
	<ul>
		{#each $featuredList as album}
			<li>
				<AlbumCard {album} />
			</li>
		{/each}
	</ul>

	<a
		class="featured"
		href={`/album/${$featuredList?.[0]?.podcastGuid}`}
		class:hide={$playingSong?.enclosure?.['@_url']}
	>
		<featurebar>
			<img
				src={$featuredList?.[0]?.artwork || $featuredList?.[0]?.image}
				loading="lazy"
				width="100"
				height="100"
			/>
			<right>
				<featuring>Featuring</featuring>
				<album-title>{$featuredList?.[0]?.title}</album-title>
				<album-author>{$featuredList?.[0]?.author}</album-author>
			</right>
		</featurebar>
	</a>
{:else if $discoverScreen === 'radio'}
	<ul>
		{#each $radio as album}
			<li>
				<AlbumCard {album} />
			</li>
		{/each}
	</ul>
{:else if $discoverScreen === 'top100'}
	<top100>
		<Top100 />
	</top100>
{:else}
	<search-header>
		<SearchBar placeholder="search for album" searchFn={handleSearch} inputFn={handleInput} />
	</search-header>
	<ul>
		{#if filteredList}
			{#each filteredList as album}
				<li>
					<AlbumCard {album} />
				</li>
			{/each}
		{:else}
			{#each $discoverList as album}
				<li>
					<AlbumCard {album} />
				</li>
			{/each}
		{/if}
	</ul>
{/if}

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
	h3 {
		text-align: center;
		font-size: 1.2em;
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

	top100 {
		display: block;
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

	featurebar {
		width: calc(100% - 24px);

		background-image: linear-gradient(
			180deg,
			var(--color-theme-yellow-light) 15%,
			var(--color-theme-yellow-dark) 66%
		);
		box-shadow: 0px 1px 10px 3px rgba(0, 0, 0, 0.75);
		display: flex;
		padding: 4px;
		margin: 8px;
		border-radius: 8px;
	}

	featurebar > img {
		width: 100px;
		border-radius: 4px;
		margin: 0 auto;
	}

	featurebar > right {
		display: flex;
		flex-direction: column;
		flex: 1;
		margin-left: 8px;
		overflow: hidden;
	}

	featuring,
	album-title,
	album-author {
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		padding: 1px;
		font-size: 1.1em;
		font-weight: 550;
	}
	featuring {
		font-size: 1.2em;
		font-weight: 800;
	}

	album-title {
		margin-top: 4px;
	}

	album-author {
		padding-left: 6px;
		font-style: italic;
		font-size: 0.9em;
	}

	a,
	a:hover {
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	navbar {
		display: flex;
		width: 100%;
		justify-content: space-around;
	}

	navbar > button {
		color: var(--color-text-0);
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: transparent;
		font-family: 'Charm', cursive;
		width: 80px;
		padding: 8px 0 0 0;
	}

	navbar > button.active {
		border-bottom: 1px solid var(--color-text-0);
	}
</style>
