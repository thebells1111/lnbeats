<script>
	import { slide } from 'svelte/transition';

	import MoreVert from '$icons/MoreVert.svelte';
	import Modals from '$c/Modals/Modals.svelte';
	import RemoveConfirmModal from './RemoveConfirmModal.svelte';

	export let itemType;
	export let item;
	export let closerActive;

	let expandMenu = false;
	let showModal = false;
	let modalScreen;

	$: if (!closerActive) {
		expandMenu = false;
	}

	function handleRemoveItem() {
		expandMenu = false;
		showModal = true;
		modalScreen = 'remove-confirm';
	}
</script>

<menu-container>
	<button
		on:click|stopPropagation|capture={() => {
			if (closerActive) {
				closerActive = false;
				setTimeout(() => {
					expandMenu = true;
					closerActive = true;
				}, 1);
			} else {
				expandMenu = true;
				closerActive = true;
			}
		}}
	>
		<MoreVert size="27" />
	</button>
	{#if expandMenu}
		<menu>
			<ul transition:slide>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<li on:click|stopPropagation={handleRemoveItem}>Remove</li>
			</ul>
		</menu>
	{/if}
</menu-container>

{#if expandMenu}
	<closer
		on:click={() => {
			expandMenu = false;
			closerActive = false;
		}}
	/>
{/if}

<Modals bind:showModal>
	{#if modalScreen === 'remove-confirm'}
		<RemoveConfirmModal bind:showModal {item} {itemType} />
	{/if}
</Modals>

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
		position: fixed;
		height: 100vh;
		width: 100vw;
		top: 0;
		left: 0;
	}
</style>
