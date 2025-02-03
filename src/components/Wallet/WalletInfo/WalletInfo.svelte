<script>
	import { user, remoteServer } from '$/stores';
	export let showWallet;

	async function handleSignOut() {
		const res = await fetch(remoteServer + 'api/alby/logout', { credentials: 'include' });

		const data = await res.json();
		console.log(data);
		$user = data;
		showWallet = false;
	}
</script>

<div>
	{$user.name}
	<h2>{$user.balance} sats</h2>
	<button on:click={handleSignOut}>Sign Out</button>
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	button {
		position: absolute;
		left: 0;
		top: -34px;
		padding: 8px 8px 8px 0;
		z-index: 40px;
		color: var(--color-text-0);
		background-color: transparent;
	}
</style>
