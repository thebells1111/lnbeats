<script>
	import { getStores, navigating, page, updated } from '$app/stores';
	import SearchBar from './SearchBar.svelte';
</script>

{#if $page.route.id === '/search'}
	<SearchBar />
{/if}
