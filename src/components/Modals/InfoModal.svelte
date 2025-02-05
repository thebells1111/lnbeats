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

	.close {
		position: absolute;
		top: 0;
		right: 0;
		background-color: transparent;
		padding: 8px;
		color: rgba(255, 255, 255, 0.75);
		z-index: 33;
	}

	container {
		display: block;

		width: calc(100% - 32px);
		height: calc(100% - 42px);
		margin: 42px;
		overflow: hidden;
	}

	@media screen and (max-width: 992px) {
		modal {
			position: relative;
			width: 100%;
			height: calc(100%);
			overflow-y: auto;
			overflow-x: hidden;
			border-radius: 8px;
		}
	}
</style>
