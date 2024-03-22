<script>
	import { page } from '$app/stores';
	import GuidPage from './GuidPage.svelte';
	import NamePage from './NamePage.svelte';

	function isValidGuid(guid) {
		const regex =
			/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
		return regex.test(guid);
	}
</script>

{#if isValidGuid($page.params.artist) || true}
	<GuidPage />
{:else}
	<NamePage />
{/if}
