<script>
	import TrackSorter from './TrackSorter.svelte';
	export let playlist;
	console.log(playlist);
</script>

<div class="container">
	<div class="left">
		<label>
			Title
			<input bind:value={playlist.title} />
		</label>
		<label>
			Description
			<textarea bind:value={playlist.description} />
		</label>
	</div>
	<div class="right">
		<TrackSorter bind:tracks={playlist.remoteSongs} bind:playlist />
	</div>
</div>

<style>
	.container {
		display: flex;
		width: 100%;
	}

	.left {
		width: 50%;
	}
	label {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	input {
		width: calc(100% - 16px);
	}
	textarea {
		width: calc(100% - 16px);
		height: 300px;
		resize: none;
	}
</style>
