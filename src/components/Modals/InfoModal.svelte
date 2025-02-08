<script>
	import Close from '$icons/Close.svelte';

	export let showModal = false;
	export let onClose = async () => {};

	async function closeModal() {
		await onClose();
		showModal = false;
	}
</script>

<blurred-background on:mousedown|self={closeModal} on:touchend|self={closeModal}>
	<modal>
		<container>
			<slot />
		</container>
	</modal>
</blurred-background>

<style>
	blurred-background {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		position: absolute;
		background: transparent;
		top: 0;
		right: 0;
		z-index: 999 !important;
		backdrop-filter: blur(5px);
	}

	modal {
		display: block;
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		border-radius: 8px;
		background-color: var(--color-poster-bg-0);
		box-shadow: 0px 3px 10px 3px rgba(0, 0, 0, 1);
	}
</style>
