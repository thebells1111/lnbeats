<script>
	import './styles.css';
	import NavHeader from './main/NavHeader/NavHeader.svelte';
	import NavFooter from './main/NavFooter/NavFooter.svelte';
	import Player from './components/Player/Player.svelte';
	import { playingSong, playingAlbum, player } from '$/stores';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import localforage from 'localforage';

	onMount(async () => {
		const albumDB = localforage.createInstance({
			name: 'albumDB'
		});
		$playingAlbum = (await albumDB.getItem('1529389')) || {};
		$playingSong = $playingAlbum.songs[0];
		$player.src = $playingSong.enclosureUrl;
	});
</script>

<app>
	{#if ![`/`, `/poster`].find((r) => r === $page.route.id)}
		<NavHeader />
	{/if}

	<main>
		<slot />
	</main>

	<Player />

	<footer>
		<NavFooter />
	</footer>
</app>

<style>
	app {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
	}

	footer {
		height: 50px;
		background-color: var(--color-nav-bg-0);
	}

	main {
		flex-grow: 1;
		overflow: scroll;
	}
</style>
