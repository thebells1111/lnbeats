<script>
	import { albumContextMenu } from '$/stores';
	import { onMount, onDestroy } from 'svelte';

	let contextMenuState;
	$: contextMenuState = $albumContextMenu;

	function copyLink() {
		navigator.clipboard.writeText(contextMenuState.link);
		closeMenu();
	}

	function openInNewTab() {
		window.open(contextMenuState.link, '_blank');
		closeMenu();
	}

	function closeMenu() {
		$: albumContextMenu = { visible: false, x: 0, y: 0, link: '', id: null };
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

{#if contextMenuState.visible && contextMenuState.id === contextMenuState.id}
	<div class="context-menu" style="top: {contextMenuState.y}px; left: {contextMenuState.x}px">
		{contextMenuState.id}
		<div class="menu-item" on:click={copyLink}>Copy Link</div>
		<div class="menu-item" on:click={openInNewTab}>Open in New Tab</div>
	</div>
{/if}

<style>
	.context-menu {
		position: absolute;
		background: #fff;
		border: 1px solid #ccc;
		box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		width: 150px;
		border-radius: 5px;
		color: black;
	}

	.menu-item {
		padding: 8px 12px;
		cursor: pointer;
		font-size: 14px;
	}

	.menu-item:hover {
		background: #f0f0f0;
	}
</style>
