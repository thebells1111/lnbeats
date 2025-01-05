<script>
	import { deleteAlbum } from '$functions/deleteAlbum';
	import { deletePlaylist } from '$functions/deletePlaylist';
	import { deleteSongFromPlaylist } from '$functions/deleteSongFromPlaylist';

	export let showModal = false;
	export let item;
	export let itemType;
	export let playlist;

	function handleRemoveConfirm() {
		if (itemType === 'album') {
			deleteAlbum(item);
		} else if (itemType === 'playlist') {
			deletePlaylist(item);
		} else if (itemType === 'playlist-song') {
			deleteSongFromPlaylist(item, playlist);
		}

		showModal = false;
	}
</script>

<h2>Are you sure you want to delete {item.title || item}?</h2>

<button-container>
	<button on:click={handleRemoveConfirm}>Yes</button>
	<button class="cancel" on:click={() => (showModal = false)}>No</button>
</button-container>

<style>
	h2 {
		text-align: center;
	}
	button-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	button {
		width: 100px;
		height: 33px;
		border-radius: 8px;
		align-self: flex-end;
		margin: 8px;
		background-color: var(--color-bg-button-0);
		color: var(--color-text-0);
		font-weight: 600;
		box-shadow: 0px 2px 5px 1px rgba(0, 0, 0, 0.75);
	}

	button.cancel {
		background-color: var(--color-bg-button-1);
	}
</style>
