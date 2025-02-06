<script>
	import { page } from '$app/stores';
	import LibraryMusic from '$icons/LibraryMusic.svelte';
	import HomeIcon from '$icons/Home.svelte';
	import SearchIcon from '$icons/Search.svelte'
	import Wallet from '$icons/Wallet.svelte';

	import { user, albyClientId, remoteServer, activeScreen, walletSwiper, albumSwiper, selectedAlbum, playingAlbum} from '$/stores';

	function getRedirectUrl() {
		const redirectUrl =
			`https://getalby.com/oauth?client_id=${albyClientId}&response_type=code&redirect_uri=${$page.url.href}` +
			`&scope=account:read%20balance:read%20payments:send%20invoices:read`;

		return redirectUrl;
	}
</script>

<footer>
	<nav>
		<button on:click={() => {	
			if ($playingAlbum?.['podcastGuid']){
			$selectedAlbum = $playingAlbum
			}
			document.getElementById('album-swiper').style.visibility = 'initial';
		$albumSwiper.slideTo(1);}
		}> 
		<LibraryMusic size={27} />
		Playing
	</button>
		<button on:click={() => ($activeScreen = 'library')}> <LibraryMusic size={27} />Library</button>
		<button on:click={() => ($activeScreen = 'discover')}><SearchIcon size={27} />Discover</button>
		<!-- <a href="/search"><SearchIcon size={27} />Search</a> -->
		<button
			class:inactive={!$user.loggedIn}
			on:click={async () => {
				if ($user.loggedIn) {
					document.getElementById('wallet-swiper').style.visibility = 'initial';
					$walletSwiper.slideTo(1);
					let res = await fetch(remoteServer + 'api/alby/refresh', {
						credentials: 'include'
					});
					let data = await res.json();

					if (data.lightning_address) {
						$user.balance = data.balance;
					}
				} else {
					window.location = getRedirectUrl();
				}
			}}><Wallet size={27} />Wallet</button
		>
	</nav>
</footer>

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
		color: var(--color-text-0);
	}

	.inactive {
		color: hsl(0, 76%, 55%);
	}
</style>
