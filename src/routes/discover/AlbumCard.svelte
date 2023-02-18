<script>
	export let album;
</script>

{#if album}
	<a href={`/album/${album.id}`}>
		<card>
			<img src={album.artwork || album.image} loading="lazy" width="115" height="115" />
			<album-title>{album.title}</album-title>
			<album-author>{album.author}</album-author>
		</card>
	</a>
{/if}

<style>
	card {
		display: flex;
		flex-direction: column;
		width: 160px;
		height: 160px;
		max-width: calc(100% - 16px);
		margin-bottom: 8px;
		padding: 4px;
		backdrop-filter: blur(14px);
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 8px;
	}

	img {
		width: 115px;
		border-radius: 4px;
		margin: 0 auto;
	}

	album-title,
	album-author {
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		padding: 1px;
		font-size: 1.1em;
		font-weight: 5500;
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
</style>
