<script>
	import { shareUrl, shareText } from '$/stores';

	let copySuccess = false;

	function shareTwitter() {
		window.open(`https://x.com/intent/tweet?url=${$shareUrl}`);
	}

	async function shareNative() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: $shareText,
					url: $shareUrl
				});
			} catch (err) {
				console.error('Error sharing:', err);
			}
		} else {
			shareTwitter(); // fallback to Twitter if Web Share API is not supported
		}
		$shareText = '';
		$shareUrl = '';
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText($shareUrl);
			copySuccess = true;
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
		$shareText = '';
		$shareUrl = '';
	}
</script>

<share-buttons>
	<input type="text" value={$shareUrl} readonly />
	<button-container>
		<button on:click={shareNative}>Share</button>
		<button on:click={copyLink}>Copy Link</button>
	</button-container>
</share-buttons>

<style>
	share-buttons {
		display: flex;
		flex-direction: column;
		min-width: 300px;
	}

	button-container {
		display: flex;
		margin: 16px 0 8px 0;
		align-items: center;
		justify-content: space-around;
	}

	button {
		background-color: var(--color-bg-button-0);
		padding: 8px;
		width: 100px;
		border-radius: 16px;
		font-weight: bold;
	}

	button:nth-of-type(2) {
		background-color: var(--color-theme-yellow-light);
		color: var(--color-text-0);
	}
</style>
