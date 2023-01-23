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

<input
	bind:this={searchInput}
	bind:value={searchQuery}
	on:submit={searchIndex}
	on:keypress={checkEnter}
	on:focus={() => {
		searchInput.select();
	}}
/>
