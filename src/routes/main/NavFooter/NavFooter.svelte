<script>
	import LibraryMusic from '$icons/LibraryMusic.svelte';
</script>

<footer>
	<nav>
		<a href="/library"> <LibraryMusic size={27} />Library</a>
		<a href="/">Home</a>
		<a href="/main">Main</a>
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
		background-color: var(--color-nav-bg-0);
	}

	a {
		color: var(--color-playbar-text-0);
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.6em;
	}
</style>
