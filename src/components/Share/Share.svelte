<script>
	import { shareInfo, shareSwiper } from '$/stores';

	function shareTwitter(link) {
		window.open(`https://x.com/intent/tweet?url=${link}`);
	}

	async function shareNative(link) {
		if (navigator.share) {
			try {
				await navigator.share({
					title: `Check out this latest banger by ${$shareInfo.author}\n\n`,
					url: link
				});
			} catch (err) {
				console.error('Error sharing:', err);
			}
		} else {
			shareTwitter(link); // fallback to Twitter if Web Share API is not supported
		}
		$shareSwiper.slideTo(0);
		$shareInfo = {};
	}

	async function copyLink(link) {
		try {
			await navigator.clipboard.writeText(link);
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
		$shareSwiper.slideTo(0);
		$shareInfo = {};
	}
</script>

{#if $shareInfo?.songLink}
	<h3>Share Song</h3>
	<h2>{$shareInfo?.song || ''}</h2>
	<share-buttons>
		<input type="text" value={$shareInfo.songLink} readonly />
		<button-container>
			<button on:click={shareNative.bind(this, $shareInfo.songLink)}>Share</button>
			<button on:click={copyLink.bind(this, $shareInfo.songLink)}>Copy Link</button>
		</button-container>
	</share-buttons>
{/if}

{#if $shareInfo?.albumLink}
	<h3>Share Album</h3>
	<h2>{$shareInfo?.album || ''}</h2>
	<share-buttons>
		<input type="text" value={$shareInfo.albumLink} readonly />
		<button-container>
			<button on:click={shareNative.bind(this, $shareInfo.albumLink)}>Share</button>
			<button on:click={copyLink.bind(this, $shareInfo.albumLink)}>Copy Link</button>
		</button-container>
	</share-buttons>
{/if}

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

	h2 {
		margin: 0 0 4px 8px;
	}
	h3 {
		margin: 8px 0 0 0;
	}
</style>
