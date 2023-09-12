<script>
	import { onMount } from 'svelte';

	import { favoritesDB, favorites } from '$/stores';

	onMount(async () => {
		if (!Object.keys($favorites).length) {
			$favorites = (await favoritesDB.getItem('favoritesList')) || {};
			console.log($favorites);
		}
	});
</script>

<!-- 
<ul>
	{#each Object.entries($favorites) || [] as [key, value]}
		<li>
			{value.title}
		</li>
	{/each}
</ul> -->
