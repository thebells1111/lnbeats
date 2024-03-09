<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LibraryMusic from '$icons/LibraryMusic.svelte';
	import HomeIcon from '$icons/Home.svelte';
	import Wallet from '$icons/Wallet.svelte';
	import Modal from '$c/Modals/Modals.svelte';
	import WalletInfo from '$c/Modals/WalletInfo/WalletInfo.svelte';
	import { user, albyClientId, remoteServer } from '$/stores';
	let showWallet = false;

	function getRedirectUrl() {
		const redirectUrl =
			`https://getalby.com/oauth?client_id=${albyClientId}&response_type=code&redirect_uri=${$page.url.href}` +
			`&scope=account:read%20balance:read%20payments:send%20invoices:read`;

		return redirectUrl;
	}
</script>

<footer>
	<nav>
		<a href="/library"> <LibraryMusic size={27} />Library</a>
		<a href="/"><HomeIcon size={27} />Home</a>
		<!-- <a href="/search"><SearchIcon size={27} />Search</a> -->
		<button
			class:active={$user.loggedIn}
			on:click={async () => {
				if ($user.loggedIn) {
					showWallet = true;
					let res = await fetch(remoteServer + 'api/alby/refresh', {
						credentials: 'include'
					});
					let data = await res.json();

					if (data.lightning_address) {
						$user.balance = data.balance;
					}
				} else {
					goto(getRedirectUrl());
				}
			}}><Wallet size={27} />Wallet</button
		>
	</nav>
</footer>

{#if showWallet}
	<Modal bind:showModal={showWallet}>
		<WalletInfo bind:showWallet />
	</Modal>
{/if}

<style>
	nav {
		display: flex;
		align-items: center;
		justify-content: space-around;
		min-height: 60px;
		max-height: 60px;
	}

	footer {
		background-color: transparent;
		padding-bottom: env(safe-area-inset-bottom);
	}

	a,
	button {
		color: var(--color-text-0);
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.6em;
		background-color: transparent;
		text-decoration: underline;
	}

	button {
		color: hsl(0, 76%, 55%);
	}

	.active {
		color: var(--color-text-0);
	}
</style>
