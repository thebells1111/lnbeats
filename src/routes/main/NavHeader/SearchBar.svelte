<script>
	import { indexSearchResults } from '$/stores';
	import { afterNavigate } from '$app/navigation';
	import { remoteServer } from '$/stores';
	let searchQuery = '';
	let searchInput;
	export let placeholder = 'find new music';
	export let searchFn = async () => {
		let url =
			remoteServer +
			`api/queryindex?q=${encodeURIComponent(
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
	};

	export let inputFn = () => {};

	afterNavigate(({ from }) => {
		setTimeout(() => searchInput.select(), 100);
	});

	function checkEnter(e) {
		if (e.key === 'Enter') {
			searchFn();
		}
	}
</script>

<input
	bind:this={searchInput}
	bind:value={searchQuery}
	on:submit={searchFn}
	on:keypress={checkEnter}
	on:input={inputFn}
	on:focus={() => {
		searchInput.select();
	}}
	{placeholder}
/>

<style>
	input {
		width: calc(100% - 32px);
		height: calc(100% - 24px);
		min-height: 28px;
		border-radius: 4px;
		margin: 0 16px;
		outline: 0;
		border: none;
		font-size: 1.1em;
		background-color: var(--color-input-bg-0);
	}

	input::placeholder {
		text-align: center;
		font-style: italic;
		font-weight: 300;
		font-size: 0.8em;
	}
</style>
