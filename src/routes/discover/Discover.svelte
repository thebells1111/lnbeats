<script>
	import { onMount } from 'svelte';
	import AlbumCard from './AlbumCard.svelte';
	import SearchBar from './SearchBar.svelte';
	import clone from 'just-clone';
	import extras from './extras.json';
	import Top100 from '$routes/top100/+page.svelte';
	import PlayArrow from '$icons/PlayArrow.svelte';
	import FilteredList from './FilteredList.svelte';

	import {
		discoverList,
		featuredList,
		discoverScreen,
		albumSearch,
		radio,
		remoteServer
	} from '$/stores';

	let filteredList = [];
	let demuList = [];
	let filterDemu = false;
	onMount(async () => {
		if (!$radio.length) {
			$radio = shuffleArray(extras);
			$radio = await Promise.all(
				$radio.map(async (v) => {
					const feedGuidUrl =
						remoteServer +
						`api/queryindex?q=${encodeURIComponent(`/podcasts/byfeedid?id=${v.id}`)}`;

					const res = await fetch(feedGuidUrl);
					const data = await res.json();
					console.log(data);
					if (data.status === 'true') {
						return data.feed;
					}
					return v;
				})
			);
			console.log($radio);
		}

		if ($albumSearch) {
			handleInput({ target: { value: $albumSearch } });
		} else {
			showFilteredList();
		}
		filteredList = $discoverList;
	});

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
		} else filteredList = $discoverList;
	}

	$: if (filterDemu) {
		demuList = filteredList.filter((v) => !v.generator.includes('Wavlake'));
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
		class:active={$discoverScreen === 'radio'}>Music Shows</button
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
{:else if $discoverScreen === 'radio'}
	<ul>
		<li>
			<AlbumCard
				isRadio={true}
				album={{ title: 'LN Beats Radio', artwork: '/lnbeats_logo_black_circle_192.png' }}
			/>
		</li>
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
		<SearchBar
			placeholder="search for album"
			searchFn={handleSearch}
			inputFn={handleInput}
			bind:filterDemu
		/>
	</search-header>

	{#if filteredList}
		<FilteredList items={filterDemu ? demuList : filteredList} />
	{/if}
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

	play {
		display: flex;
		align-items: flex-end;
	}
</style>
