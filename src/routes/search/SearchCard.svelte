<script>
	import { indexSearchResults, selectedAlbum } from '$/stores';
	export let album;

	function removeAlbum() {
		console.log(album);
		$indexSearchResults = $indexSearchResults.filter((v) => v.id != album.id);
	}
</script>

{#if album}
	<card>
		<img src={album.artwork || album.image} on:error={removeAlbum} />
		<album-title>{album.title}</album-title>
		<album-author>{album.author}</album-author>
	</card>
{/if}

<style>
	card {
		display: flex;
		flex-direction: column;
		width: 100%;
		width: 160px;
		margin-bottom: 8px;
		padding: 4px;
		backdrop-filter: blur(14px);
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 8px;
	}

	img {
		width: 75px;
		border-radius: 4px;
		margin-bottom: 4px;
	}

	album-title,
	album-author {
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		padding: 1px;
		font-size: 0.9em;
	}

	album-author {
		padding-left: 6px;
		font-style: italic;
		font-size: 0.8em;
	}
</style>
