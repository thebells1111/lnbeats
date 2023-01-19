<script>
	import './styles.css';
	import NavHeader from './main/NavHeader/NavHeader.svelte';
	import NavFooter from './main/NavFooter/NavFooter.svelte';
</script>

<page>
	<header>
		<NavHeader />
	</header>

	<main>
		<slot />
	</main>

	<footer>
		<NavFooter />
	</footer>
</page>

<style>
	page {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
	}

	header,
	footer {
		height: 50px;
		background-color: var(--color-nav-bg-0);
	}

	main {
		flex-grow: 1;
	}
</style>
