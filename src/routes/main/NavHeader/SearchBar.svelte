<script>
	import { indexSearchResults } from '$/stores';
	let searchQuery = '';
	let searchInput;

	async function searchIndex() {
		let url = `api/queryindex?q=${encodeURIComponent(
			`/search/music/byterm?q=${searchQuery}&val=lightning`
		)}`;

		const res = await fetch(url);
		let data = await res.json();

		try {
			data = JSON.parse(data);
			console.log(data);
			data.feeds = data.feeds || [data.feed];
			if (data.status) {
				$indexSearchResults = data.feeds.filter((feed) => !feed.title.includes('3Speak'));
			}
		} catch (error) {}
	}

	function checkEnter(e) {
		if (e.key === 'Enter') {
			searchIndex();
		}
	}
</script>

<div>
	<input
		bind:this={searchInput}
		bind:value={searchQuery}
		on:submit={searchIndex}
		on:keypress={checkEnter}
		on:focus={() => {
			searchInput.select();
		}}
	/>
</div>

<style>
	div {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
	}

	input {
		width: calc(100% - 32px);
		height: calc(100% - 24px);
		border-radius: 4px;
		margin-left: 8px;
	}
</style>
