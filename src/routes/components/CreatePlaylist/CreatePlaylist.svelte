<script>
	import { addPlaylistToMasterList } from '$functions/addPlaylistToMasterList';
	export let modalStatus;
	let name = '';
	let displayText = '';

	async function handleNewPlaylist() {
		if (name && name !== 'msp-playlist-db') {
			const { success, message } = await addPlaylistToMasterList({ name });

			displayText = message;

			console.log(success);

			if (success) {
				setTimeout(() => {
					modalStatus = false;
				}, 1000);
			}
		} else {
			displayText = 'Please choose a different playlist name';
		}
	}
</script>

<div>
	<label
		>Create New Playlist
		<input type="text" bind:value={name} />
	</label>
	<button on:click={handleNewPlaylist} disabled={!name && name !== 'msp-playlist-db'}>Save</button>
	<h2>{displayText}</h2>
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
	}
	label {
		display: flex;
		flex-direction: column;
	}
	input {
		width: calc(100% - 16px);
		margin: 4px 8px;
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
	}

	button:disabled {
		background-color: var(--color-bg-button-disabled-0);
		color: hsla(0, 0%, 0%, 0.5);
		cursor: not-allowed;
	}
</style>
