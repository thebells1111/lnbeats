<script>
	import VirtualList from 'svelte-tiny-virtual-list';
	import AlbumCard from './AlbumCard.svelte';
	import SongCard from './SongCard.svelte';
	export let items = [];
	export let fromSearch = false;
	export let isSongs = false;

	let gridHeight;
	let gridWidth;
	let rowColumns = 6;
	let itemHeight = 176; // item Height + grid margin & padding
	let itemWidth = 168; // item Height + grid margin & padding

	$: if (gridWidth > itemWidth) {
		rowColumns = Math.floor(gridWidth / itemWidth);
	} else {
		rowColumns = 1;
	}
</script>

<div
	class="list-container"
	bind:clientHeight={gridHeight}
	style={`height: calc(100% - 46px); overflow:hidden`}
>
	<div class="grid" bind:clientWidth={gridWidth}>
		<VirtualList
			width="100%"
			height={gridHeight}
			itemCount={Math.ceil(items.length / rowColumns)}
			itemSize={itemHeight}
		>
			<div slot="item" let:index let:style {style}>
				<div class="row" style="--grid-columns: {rowColumns};">
					{#each Array(rowColumns) as _, i}
						{#if items[index * rowColumns + i]}
							{#if isSongs}
								<SongCard song={items[index * rowColumns + i]} />
							{:else}
								<AlbumCard album={items[index * rowColumns + i]} {fromSearch} />
							{/if}
						{/if}
					{/each}
				</div>
			</div>
		</VirtualList>
	</div>
</div>

<style>
	.row {
		display: grid;
		gap: 4px;
		grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
	}
</style>
