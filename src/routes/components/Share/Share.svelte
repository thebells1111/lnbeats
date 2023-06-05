<script>
	import { onMount } from 'svelte';

	export let url = '';
	export let shareText = '';

	let copySuccess = false;

	function shareTwitter() {
		const text = encodeURIComponent(shareText);
		window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`);
	}

	async function shareNative() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: shareText ,
					url: url
				});
			} catch (err) {
				console.error('Error sharing:', err);
			}
		} else {
			shareTwitter(); // fallback to Twitter if Web Share API is not supported
		}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			copySuccess = true;
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	}
</script>

<div class="share-buttons">
	<button on:click={shareNative}>Share</button>
	<button on:click={copyLink}>Copy Link</button>
	{#if copySuccess}
		<div>Link copied to clipboard!</div>
	{/if}
</div>
