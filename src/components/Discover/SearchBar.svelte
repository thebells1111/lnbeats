<script>
	import { albumSearch } from '$/stores';
	import CancelFilled from '$icons/CancelFilled.svelte';
	let searchQuery = $albumSearch || '';
	let searchInput;
	export let placeholder = 'find new music';

	export let inputFn = () => {};
	export let filterDemu = false;
</script>

<div>
	<input
		bind:this={searchInput}
		bind:value={searchQuery}
		on:input={inputFn}
		on:focus={() => {
			// searchInput.select();
		}}
		{placeholder}
	/>

	{#if searchQuery}
		<button
			class="cancel"
			on:click={() => {
				$albumSearch = '';
				searchQuery = '';
				inputFn({ target: { value: '' } });
			}}><CancelFilled size="24" /></button
		>
	{/if}
	<button
		class="demu"
		class:active={filterDemu}
		on:click={() => {
			filterDemu = !filterDemu;
		}}>DeMu</button
	>
</div>

<style>
	div {
		width: calc(100% - 32px);
		height: calc(100% - 24px);
		min-height: 28px;
		margin: 0 16px;
		position: relative;
		display: flex;
		align-items: center;
	}
	input {
		width: calc(100% - 4px);
		height: calc(100%);
		min-height: 28px;
		border-radius: 4px;
		outline: 0;
		border: none;
		font-size: 1.1em;
		background-color: var(--color-input-bg-0);
	}

	input::placeholder {
		text-align: center;
		font-style: italic;
		font-weight: 300;
		font-size: 0.8em;
	}

	button {
		background-color: transparent;
		color: var(--color-text-0);
		height: 100%;
		display: flex;
		align-items: center;
	}

	button.demu {
		margin-left: 12px;
	}

	button.cancel {
		position: absolute;
		right: 56px;
		top: 2px;
	}

	button.demu.active {
		text-shadow: 0 0 5px #ffa500, 0 0 15px #ffa500, 0 0 20px #ffa500, 0 0 40px #ffa500,
			0 0 60px #ff0000, 0 0 10px #ff8d00, 0 0 98px #ff0000;
		color: #fff6a9;
	}
</style>
