<script>
	import SearchIcon from '$icons/Search.svelte';
	import { page } from '$app/stores';
</script>

<header class:hidden={[`/`, `/library`, '/discover', '/search'].find((r) => r === $page.route.id)}>
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
		padding-top: env(safe-area-inset-top);
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
