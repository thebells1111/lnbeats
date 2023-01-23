<script>
	import { page } from '$app/stores';

	import { goto, afterNavigate } from '$app/navigation';
	import SearchBar from './SearchBar.svelte';
	let previousPage = '';

	function navigateBack() {
		if (previousPage) {
			goto(previousPage);
		} else goto('/library');
	}

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
		console.log(previousPage);
	});
</script>

<header>
	{#if ![`/`, `/library`].find((r) => r === $page.route.id)}
		<button on:click={navigateBack}>Back</button>
	{/if}

	{#if $page.route.id === '/search'}
		<SearchBar />
	{/if}

	{#if $page.route.id === '/library'}
		<a href="/search">Search</a>
	{/if}
</header>

<style>
	header {
		height: 50px;
		background-color: var(--color-nav-bg-0);
	}
</style>
