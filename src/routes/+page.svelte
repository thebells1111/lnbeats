<script>
	import { indexSearchResults, selectedAlbum } from '$/stores';
</script>

<ul>
	{#each $indexSearchResults as result}
		<li>{result.title}</li>
	{/each}
</ul>
