<script>
	import { dev } from '$app/environment';

	function getRedirect() {
		const url = new URL(window.location.href);
		return `${url.protocol}//${url.host}${url.pathname}`;
	}
</script>

<card>
	<a
		class="alby-login"
		href={`https://getalby.com/oauth?client_id=${
			dev ? '32dVOIuGiA' : '9QX2jPuEiu'
		}&response_type=code&redirect_uri=${getRedirect()}&scope=account:read%20balance:read%20payments:send`}
	>
		<img src="/alby.png" />
		<h3>Log In or Create an account using Alby.</h3>
	</a>

	<!-- <p>
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
		</p> -->
</card>

<style>
	card {
		height: calc(100%);
		width: calc(100% - 36px);
		max-width: 380px;
		max-height: 660px;
		border-radius: 8px;
		padding: 8px;
		background-color: var(--color-bg-boostagram-1);
		color: var(--color-text-0);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	h3 {
		text-align: center;
		margin: 0 0 80px 0;
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
