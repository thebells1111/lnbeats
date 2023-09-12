<script>
	import QueueMusic from '$icons/QueueMusic.svelte';
	import FavoriteFilled from '$icons/FavoriteFilled.svelte';

	export let album = {};
	export let playlist;
	export let favorites;
	console.log(album);
</script>

<album>
	{#if playlist}
		<queue-icon>
			<QueueMusic size="55" />
		</queue-icon>
	{:else if favorites}
		<queue-icon class="favorites">
			<FavoriteFilled size="42" />
		</queue-icon>
	{:else}
		<img src={album.art} />
	{/if}

	<album-info>
		<p>{album.title || playlist || 'Favorites'}</p>
	</album-info>
</album>

<style>
	album {
		display: flex;
		align-items: center;
	}
	img,
	queue-icon {
		min-width: 60px;
		max-width: 60px;
		max-height: 60px;
		min-height: 60px;
		margin-right: 8px;
		border-radius: 4px;
	}

	queue-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-poster-bg-0);
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 33%,
			var(--color-poster-bg-1) 66%
		);
	}

	.favorites {
		color: rgb(249, 24, 128);
	}
</style>
