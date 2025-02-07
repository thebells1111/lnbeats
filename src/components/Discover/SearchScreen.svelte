<script>
	import VirtualList from './VirtualList.svelte';

	export let filteredSongList;
	export let filteredList;
	export let filterDemu;
	export let demuList;

	let screen = 'albums';
</script>

<button
	on:click={() => {
		screen = 'albums';
	}}>Albums</button
>
<button
	on:click={() => {
		screen = 'songs';
	}}>Songs</button
>

{#if screen === 'albums'}
	{#if filteredList}
		<VirtualList items={filterDemu ? demuList : filteredList} fromSearch={true} />
	{/if}
{:else if screen === 'songs'}
	{#if filteredSongList}
		<VirtualList items={filteredSongList} />
	{/if}
{/if}
