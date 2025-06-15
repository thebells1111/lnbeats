<script>
	import { onMount } from 'svelte';
	import AlbumCard from './AlbumCard.svelte';
	import SearchBar from './SearchBar.svelte';
	import clone from 'just-clone';
	import extras from './extras.json';
	import VirtualList from './VirtualList.svelte';
	import Album from '$c/Album/Album.svelte';
	import SearchScreen from './SearchScreen.svelte';

	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';

	const parserOptions = {
		attributeNamePrefix: '@_',
		//attrNodeName: false,
		//textNodeName : "#text",
		ignoreAttributes: false,
		ignoreNameSpace: false,
		attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
		tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
	};

	import {
		discoverList,
		featuredList,
		discoverScreen,
		albumSearch,
		radio,
		remoteServer,
		top100,
		activeScreen,
		masterSongList
	} from '$/stores';

	let filteredList = [];
	let filteredSongList = [];
	let demuList = [];
	let filterDemu = false;
	let timeoutId = null;
	let top100Loading = false;
	let top100Loaded = false;
	let radioLoading = false;
	let radioLoaded = false;

	onMount(async () => {
		if ($albumSearch) {
			handleInput({ target: { value: $albumSearch } });
		} else {
			showFilteredList();
		}
		filteredList = $discoverList;
	});

	async function fetchTop100() {
		top100Loading = true;

		const albumUrl =
			remoteServer + `api/queryindex?q=${encodeURIComponent(`podcasts/byfeedid?id=6612768`)}`;
		const albumRes = await fetch(albumUrl);
		const albumData = await albumRes.json();

		const res = await fetch(remoteServer + `api/proxy?url=${albumData.feed.url}`);
		let data = await res.text();

		let xml2Json = parse(data, parserOptions);
		let feed = xml2Json.rss.channel;

		// music playlist feeds (musicL) can only contain remoteItems
		albumData.feed.remoteSongs = [].concat(feed?.['podcast:remoteItem'] || []).map((v) => {
			if (!v.enclosure) {
				v.enclosure = { '@_type': v.enclosureType, '@_url': v.enclosureUrl };
			}

			return v;
		});
		albumData.feed.songs = [];

		$top100 = albumData.feed;

		top100Loading = false;
		top100Loaded = true;
	}

	async function fetchRadio() {
		radioLoading = true;

		$radio = shuffleArray(extras);
		$radio = await Promise.all(
			$radio.map(async (v) => {
				const feedGuidUrl =
					remoteServer +
					`api/queryindex?q=${encodeURIComponent(`/podcasts/byfeedid?id=${v.id}`)}`;

				const res = await fetch(feedGuidUrl);
				const data = await res.json();
				if (data.status === 'true') {
					return data.feed;
				}
				return v;
			})
		);

		radioLoading = false;
		radioLoaded = true;
	}

	function showFilteredList() {
		if ($discoverList.length) {
			filteredList = clone($discoverList);
		} else {
			setTimeout(showFilteredList, 100);
		}
	}

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

			filteredSongList = $masterSongList
				.filter((v) => v.title.toLowerCase().includes(query))
				.sort((a, b) => a.title.localeCompare(b.title));
		} else {
			filteredList = $discoverList;
			filteredSongList = $masterSongList;
		}
	}

	// Load the top 100 and radio feed lists only when needed
	$: if ($discoverScreen === 'top100' && !top100Loaded && !top100Loading) {
		fetchTop100();
	}

	$: if ($discoverScreen === 'radio' && !radioLoaded && !radioLoading) {
		fetchRadio();
	}

	$: if (filterDemu) {
		demuList = filteredList.filter((v) => !v.generator.includes('Wavlake'));
	}
</script>

<discover class:show={$activeScreen === 'discover'}>
	<header>
		<img src="/lnbeats-header.png" alt="ln beats logo" />
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
			class:active={$discoverScreen === 'radio'}>Music Shows</button
		>
		<button
			on:click={() => {
				$discoverScreen = 'search';
			}}
			class:active={$discoverScreen === 'search'}>Search</button
		>
	</navbar>

	<featured class:show={$discoverScreen === 'featured'}>
		<h3>Support These Artist Who Support LNBeats</h3>
		<VirtualList items={$featuredList} />
	</featured>

	<top100 class:show={$discoverScreen === 'top100'}>
		{#if $top100.id}
			<Album album={$top100} />
		{/if}
	</top100>

	<music-shows class:show={$discoverScreen === 'radio'}>
		<ul>
			{#each $radio as album}
				<li>
					<AlbumCard {album} />
				</li>
			{/each}
		</ul>
	</music-shows>

	<search class:show={$discoverScreen === 'search'}>
		<search-header>
			<SearchBar
				placeholder="search"
				searchFn={handleSearch}
				inputFn={handleInput}
				bind:filterDemu
			/>
		</search-header>
		<SearchScreen {filterDemu} {demuList} {filteredList} {filteredSongList} />
	</search>
</discover>

<style>
	discover {
		display: none;
		overflow: hidden;
		height: 100%;
	}

	.show {
		display: block;
	}
	header {
		display: flex;
		justify-content: flex-end;
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
		height: calc(100% - 60px);
		flex-wrap: wrap;
		justify-content: center;
		overflow: auto;
	}

	music-shows > ul {
		height: calc(100% - 8px);
	}

	li {
		list-style: none;
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
		text-decoration: none;
	}

	navbar > button.active {
		border-bottom: 1px solid var(--color-text-0);
	}

	featured,
	top100,
	music-shows,
	search {
		display: none;
		height: calc(100% - 84px);
		overflow: hidden;
	}

	.show {
		display: block;
	}
</style>
