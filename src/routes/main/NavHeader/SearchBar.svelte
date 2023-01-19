<script>
	import { indexSearchResults } from '$/stores';
	let searchQuery = 'able';
	let searchInput;

	async function searchIndex() {
		console.log(searchQuery);

		let url = `api/queryindex?q=${encodeURIComponent(
			`/search/music/byterm?q=${searchQuery}&val=lightning`
		)}`;

		console.log(url);

		const res = await fetch(url);
		let data = await res.json();

		try {
			data = JSON.parse(data);

			if (data.status) {
				$indexSearchResults = data.feeds;
			}
		} catch (error) {}

		console.log($indexSearchResults);
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
