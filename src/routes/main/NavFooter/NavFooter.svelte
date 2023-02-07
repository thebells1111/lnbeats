<script>
	import LibraryMusic from '$icons/LibraryMusic.svelte';
	import HomeIcon from '$icons/Home.svelte';
	import SearchIcon from '$icons/Search.svelte';
</script>

<footer>
	<nav>
		<a href="/library"> <LibraryMusic size={27} />Library</a>
		<a href="/"><HomeIcon size={27} />Home</a>
		<a href="/search"><SearchIcon size={27} />Search</a>
	</nav>
</footer>

<style>
	nav {
		display: flex;
		align-items: center;
		justify-content: space-around;
		min-height: 60px;
		max-height: 60px;
	}

	footer {
		background-color: transparent;
	}

	a {
		color: var(--color-text-0);
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.6em;
	}
</style>
