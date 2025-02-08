<script>
	import VirtualList from './VirtualList.svelte';
	import { albumSearch } from '$/stores';

	export let filteredSongList;
	export let filteredList;
	export let filterDemu;
	export let demuList;

	let screen = 'albums';

	$: if (!$albumSearch) {
		screen = 'albums';
	}
</script>

<button-container class:hidden={!$albumSearch}>
	<button
		class:active={screen === 'albums'}
		on:click={() => {
			screen = 'albums';
		}}>Albums</button
	>
	<button
		class:active={screen === 'songs'}
		on:click={() => {
			screen = 'songs';
		}}>Songs</button
	>
</button-container>

<container class:extend={!$albumSearch}>
	{#if screen === 'albums'}
		{#if filteredList}
			<VirtualList items={filterDemu ? demuList : filteredList} fromSearch={true} />
		{/if}
	{:else if screen === 'songs'}
		{#if filteredSongList}
			<VirtualList items={filteredSongList} isSongs={true} />
		{/if}
	{/if}
</container>

<style>
	button-container {
		display: flex;
		align-items: center;
		justify-content: space-around;
		height: 20px;
		margin: 8px 0 16px 0;
	}

	container {
		display: block;
		height: calc(100% - 52px);
	}

	button {
		width: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-0);
		background-color: transparent;
	}

	.active {
		border-bottom: 1px solid var(--color-text-0);
	}

	.hidden {
		display: none;
	}

	.extend {
		height: 100%;
	}
</style>
