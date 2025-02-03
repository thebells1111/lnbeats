<script>
	import { slide } from 'svelte/transition';

	import MoreVert from '$icons/MoreVert.svelte';

	import { playlistControls, playlistControlsSwiper, activeScreen } from '$/stores';

	export let itemType = '';
	export let item = {};
	export let playlist = {};

	let expandMenu = false;

	$: if ($activeScreen !== 'library') {
		expandMenu = false;
	}

	function handleShowPlaylistControls() {
		expandMenu = false;
		document.getElementById('playlist-controls-swiper').style.visibility = 'initial';
		$playlistControlsSwiper.slideTo(1);

		console.log(itemType);

		$playlistControls = {
			type: 'remove',
			item,
			playlist,
			itemType
		};
	}
</script>

<menu-container>
	<button
		on:click|stopPropagation|capture={() => {
			expandMenu = !expandMenu;
		}}
	>
		<MoreVert size="27" />
	</button>
	{#if expandMenu}
		<menu>
			<ul transition:slide|global>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<li on:click|stopPropagation={handleShowPlaylistControls}>Remove</li>
			</ul>
		</menu>
	{/if}
</menu-container>

{#if expandMenu}
	<closer
		on:click={() => {
			expandMenu = false;
		}}
	/>
{/if}

<style>
	button {
		position: relative;
		background-color: transparent;
		color: var(--color-text-0);
		width: 40px;
		height: 50px;
		z-index: 2;
	}
	menu-container {
		position: relative;
	}

	menu {
		position: absolute;
		right: 0;
		padding: 0;
		margin: 0;
	}

	menu ul {
		position: relative;
		width: 120px;
		padding: 0;
		margin: 0;
		z-index: 3;
	}

	menu ul li {
		display: flex;
		list-style: none;
		justify-content: space-between;
		border-bottom: none;
		padding: 8px;
		background-color: var(--color-bg-context-menu);
		background-image: linear-gradient(
			180deg,
			var(--color-bg-context-menu-0) 15%,
			var(--color-bg-context-menu-1) 66%
		);
		box-shadow: 0px 1px 10px 3px rgba(0, 0, 0, 0.75);
	}

	closer {
		display: block;
		position: absolute;
		height: calc(100% - 60px);
		width: 100%;
		top: 0;
		left: 0;
	}
</style>
