<script>
	import localforage from 'localforage';
	import { onMount } from 'svelte';
	import { library } from '$/stores';
	import AlbumCard from './AlbumCard.svelte';

	onMount(async () => {
		const libraryDB = localforage.createInstance({
			name: 'libraryDB'
		});
		$library = (await libraryDB.getItem('library')) || {};
		console.log(Object.entries($library));
	});
</script>

<ul>
	{#each Object.entries($library) as [id, album]}
		<li>
			<a href={`/album/${id}`}>
				<AlbumCard {album} />
			</a>
		</li>
	{/each}
</ul>

<style>
	ul {
		padding: 0;
		margin: 4px 0;
	}
	li {
		list-style-type: none;
		padding: 4px;
		margin: 0 4px;
		border-bottom: 1px solid var(--color-text-2);
	}
</style>
