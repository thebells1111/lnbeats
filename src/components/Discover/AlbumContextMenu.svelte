<script>
	import { albumContextMenu } from '$/stores';
	import { onMount, onDestroy } from 'svelte';

	export let album;

	function copyLink() {
		navigator.clipboard.writeText($albumContextMenu.link);
		closeMenu();
	}

	function openInNewTab() {
		window.open($albumContextMenu.link, '_blank');
		closeMenu();
	}

	function closeMenu() {
		$albumContextMenu = { visible: false, link: '', id: null };
	}

	function handleClickOutside(event) {
		if (!event.target.closest('.context-menu')) {
			closeMenu();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
	});

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
	});
</script>

{#if $albumContextMenu.visible && album.id === $albumContextMenu.id}
	<div class="context-menu">
		<div class="menu-item" on:click|stopPropagation={copyLink}>Copy Link</div>
		<div class="menu-item" on:click|stopPropagation={openInNewTab}>Open in New Tab</div>
	</div>
{/if}

<style>
	.context-menu {
		position: absolute;
		background-color: var(--color-poster-bg-0);
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 15%,
			var(--color-poster-bg-1) 66%
		);
		box-shadow: 0px 1px 10px 3px rgba(0, 0, 0, 0.75);
		z-index: 1000;
		width: 125px;
		border-radius: 5px;
		color: var(--color-text-0);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.menu-item {
		padding: 8px 8px;
		cursor: pointer;
		font-size: 14px;
		width: calc(100% - 16px);
		text-align: left;
	}

	.menu-item:hover {
		background-color: var(--color-bg-context-menu-0);
		background-image: linear-gradient(
			180deg,
			var(--color-bg-context-menu-0) 15%,
			var(--color-bg-context-menu-1) 66%
		);
	}
</style>
