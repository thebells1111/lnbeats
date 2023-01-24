<script>
	export let album = {};
	console.log(album);
</script>

<album>
	<img src={album.art} />
	<album-info>
		<p>{album.title}</p>
	</album-info>
</album>

<style>
	album {
		display: flex;
	}
	img {
		min-width: 60px;
		max-width: 60px;
		max-height: 60px;
		margin-right: 8px;
	}
</style>
