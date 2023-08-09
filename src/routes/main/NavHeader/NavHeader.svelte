<script>
	import BackArrowIcon from '$icons/BackArrow.svelte';
	import SearchIcon from '$icons/Search.svelte';
	import { page } from '$app/stores';

	import { goto, afterNavigate } from '$app/navigation';
	import SearchBar from './SearchBar.svelte';
	let previousPage = '';

	function navigateBack() {
		if (previousPage) {
			goto(previousPage);
		} else goto('/discover');
	}

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
		console.log(previousPage);
	});
</script>

<header class:hidden={[`/`, `/library`, '/discover', '/search'].find((r) => r === $page.route.id)}>
	{#if ![`/`, `/library`, '/discover', '/search'].find((r) => r === $page.route.id)}
		<button class="back-button" on:click={navigateBack}><BackArrowIcon size={30} /></button>
	{/if}

	{#if $page.route.id === '/search'}
		<SearchBar />
	{/if}

	{#if $page.route.id === '/discover'}
		<a href="/search"><SearchIcon size={30} /></a>
	{/if}
</header>

<style>
	header {
		min-height: 50px;
		max-height: 50px;
		display: flex;
		align-items: center;
		padding-top: env(safe-area-inset-bottom);
	}

	.hidden {
		display: none;
	}

	.back-button {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		padding: 0;
		margin: 0;
		background-color: transparent;
		min-width: 45px;
		height: 45px;
		color: white;
	}

	a[href='/search'] {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-playbar-text-0);
		height: 45px;
		width: 45px;
	}
</style>
