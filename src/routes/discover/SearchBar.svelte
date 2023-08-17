<script>
	import { indexSearchResults } from '$/stores';
	import { remoteServer, albumSearch } from '$/stores';
	import CancelFilled from '$icons/CancelFilled.svelte';
	let searchQuery = $albumSearch || '';
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

	function checkEnter(e) {
		if (e.key === 'Enter') {
			searchFn();
		}
	}
</script>

<div>
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

	{#if searchQuery}
		<button
			on:click={() => {
				$albumSearch = '';
				searchQuery = '';
				inputFn({ target: { value: '' } });
			}}><CancelFilled size="24" /></button
		>
	{/if}
</div>

<style>
	div {
		width: calc(100% - 32px);
		height: calc(100% - 24px);
		min-height: 28px;
		margin: 0 16px;
		position: relative;
	}
	input {
		width: calc(100% - 4px);
		height: calc(100%);
		min-height: 28px;
		border-radius: 4px;
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

	button {
		position: absolute;
		background-color: transparent;
		right: 2px;
		top: 2px;
		color: var(--color-bg-2);
		height: 100%;
		display: flex;
		align-items: center;
	}
</style>
