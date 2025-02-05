<script>
	import Sortable from 'sortablejs';
	import { onMount } from 'svelte';
	import loadRemoteInfo from '$functions/loadRemoteInfo';

	export let tracks = [];
	export let album;
	let trackNames = [];

	function handleSort(e) {
		const { oldIndex, newIndex } = e;
		// Move the item in the array
		if (oldIndex !== newIndex) {
			const movedItem = tracks.splice(oldIndex, 1)[0];
			const _movedItem = trackNames.splice(oldIndex, 1)[0];
			tracks.splice(newIndex, 0, movedItem);
			trackNames.splice(newIndex, 0, _movedItem);
		}
		album.remoteSongs = tracks;
	}

	let foo;

	onMount(async function () {
		Sortable.create(foo, {
			group: {
				name: 'foo',
				put: true,
				pull: false
			},
			animation: 200,
			onSort: handleSort
		});

		trackNames = await Promise.all(tracks.map((v) => loadRemoteInfo(v)));
	});
</script>

<track-list-container>
	<sortable-list-container bind:this={foo}>
		{#each trackNames as track}
			<div class="list-group-item">
				{track.title} - {track.feedTitle}
			</div>
		{/each}
	</sortable-list-container>
</track-list-container>

<style>
	.list-group-item {
		padding: 0 8px;
		margin: 4px;
		border: 1px solid white;
		transition: background-color 0.2s;
		min-height: 40px;
		display: flex;
		align-items: center;
	}

	.list-group-item:hover {
		cursor: grab;
		background-color: black;
	}

	track-list-container {
		display: flex;
		width: 100%;
	}

	sortable-list-container {
		width: 100%;
	}

	div {
		width: 100%;
		height: 42px;
		overflow: hidden;
	}
</style>
