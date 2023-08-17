<script>
	import Close from '$icons/Close.svelte';

	export let modalStatus = false;

	function closeModal() {
		modalStatus = false;
	}
</script>

{#if modalStatus}
	<blurred-background on:mousedown|self={closeModal} on:touchend|self={closeModal}>
		<modal>
			<button class="close" on:click={closeModal}>
				<Close size="24" />
			</button>

			<container>
				<slot />
			</container>
		</modal>
	</blurred-background>
{/if}

<style>
	blurred-background {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		position: fixed;
		background: transparent;
		top: 0;
		right: 0;
		z-index: 99;
	}

	modal {
		display: block;
		position: relative;

		overflow-y: auto;
		overflow-x: hidden;
		border-radius: 8px;
		background-color: var(--color-poster-bg-0);
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 33%,
			var(--color-poster-bg-1) 66%
		);

		max-width: 720px;
		width: 100%;
		height: calc(100vh - 16px);
		flex-grow: 1;
		box-shadow: 0px 1px 10px 3px rgba(0, 0, 0, 0.75);
	}

	.close {
		position: fixed;
		top: max(8px, env(safe-area-inset-top));
		left: calc(50% + min(316px, calc((100% / 2) - 44px)));
		background-color: transparent;
		padding: 8px;
		color: rgba(255, 255, 255, 0.75);
		z-index: 33;
	}

	container {
		display: block;
		width: calc(100% - 32px - env(safe-area-inset-right) - env(safe-area-inset-left));
		height: calc(100% - 42px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
		margin: calc(42px + env(safe-area-inset-top)) calc(16px + env(safe-area-inset-right))
			env(safe-area-inset-bottom) calc(16px + env(safe-area-inset-left));
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
