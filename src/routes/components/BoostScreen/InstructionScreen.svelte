<script>
	import { posterSwiper, showInstructionScreen } from '$/stores';
	import { dev } from '$app/environment';
	import Close from '$icons/CancelFilled.svelte';

	function getRedirect() {
		const url = new URL(window.location.href);
		return `${url.protocol}//${url.host}${url.pathname}`;
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<blurred-background on:click|self={() => ($showInstructionScreen = false)}>
	<button
		class="close"
		on:click={() => {
			$showInstructionScreen = false;
			$posterSwiper.enabled = true;
		}}
	>
		<Close size={30} style={'color: var(--color-text-boost-cancel-0);'} />
	</button>
	<card>
		<h2>You don't have a wallet enabled!!!</h2>
		<a
			class="alby-login"
			href={`https://getalby.com/oauth?client_id=${
				dev ? '32dVOIuGiA' : '9QX2jPuEiu'
			}&response_type=code&redirect_uri=${getRedirect()}&scope=account:read%20balance:read%20payments:send`}
		>
			<img src="/alby.png" />
			<h3>Log In or Create an account using Alby.</h3>
		</a>

		<p>
			You can also use WebLN plus your favorite Client Provider using your Desktop Browser or the
			<a href="https://kiwibrowser.com/">Kiwi Browser</a> on a mobile device.
		</p>

		<p>
			We like <a href="https://getalby.com/">Alby</a> as a WebLN provider, but you can also use your
			favorite provider including
			<a href="https://getalby.com/">Joule</a>,
			<a href="https://bluewallet.io/">BlueWallet</a>,
			<a href="https://github.com/fiatjaf/kwh/">kwh</a> or
			<a href="https://blixtwallet.github.io/">Blixt Wallet</a>.
		</p>
	</card>
</blurred-background>

<style>
	blurred-background {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 99;
		backdrop-filter: blur(5px);
	}

	card {
		height: calc(100% - 48px);
		width: calc(100% - 36px);
		max-width: 380px;
		max-height: 660px;
		border-radius: 8px;
		padding: 8px;
		background-color: var(--color-bg-boostagram-1);
		color: var(--color-text-0);
		display: flex;
		flex-direction: column;
	}

	h2,
	h3 {
		text-align: center;
		margin: 0;
	}

	h2 {
		margin-top: 8px;
	}
	.alby-login {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 32px 0;
	}

	img {
		width: 200px;
	}

	p {
		margin: 8px 16px;
	}

	a {
		color: var(--color-text-4);
	}

	button.close {
		position: absolute;
		top: max(2px, env(safe-area-inset-top));
		left: 2px;
		width: 50px;
		height: 50px;
		display: flex;
		justify-content: flex-start;
		background-color: transparent;
		border: none;
		/* background-color: red; */
	}
</style>
