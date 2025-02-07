<script>
	import TrackSorter from './TrackSorter.svelte';
	export let album;
	console.log(album);
</script>

<div class="container">
	<div class="left">
		<label>
			Title
			<input bind:value={album.title} />
		</label>
		<label>
			Description
			<textarea bind:value={album.description} />
		</label>
	</div>
	<div class="right no-scroll">
		<TrackSorter bind:tracks={album.remoteSongs} bind:album />
	</div>
</div>

<style>
	.container {
		display: flex;
		width: calc(100% - 32px);
		overflow: auto;
		height: 100%;
		padding: 0 16px;
	}

	.left {
		width: 50%;
	}

	.right {
		width: calc(50% - 24px);
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

	@media screen and (max-width: 992px) {
		.container {
			flex-direction: column;
			overflow: auto;
			width: calc(100% - 40px);
			padding-left: 28px;
		}

		textarea {
			width: calc(100% - 24px);
			height: 150px;
			margin-bottom: 8px;
		}

		input {
			width: calc(100% - 24px);
		}

		.left {
			width: 100%;
		}

		.right {
			width: calc(100% - 40px);
		}
	}
</style>
