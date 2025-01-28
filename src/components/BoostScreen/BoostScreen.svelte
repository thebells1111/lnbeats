<script>
	import localforage from 'localforage';
	import throwConfetti from '$functions/throwConfetti';
	import sendBoost from '$functions/sendBoost';
	import clone from 'just-clone';

	import {
		posterSwiper,
		satsPerSong,
		senderName,
		satsPerBoost,
		user,
		webln,
		showBoostScreen,
		currentBoostDestinations,
		playingAlbum,
		playingSong
	} from '$/stores';
	import Close from '$icons/CancelFilled.svelte';
	import RocketLaunch from '$icons/RocketLaunch.svelte';

	let showAppSupport = false;

	let boostagram = '';
	let satAmount = $satsPerBoost;

	$: console.log('appSupport: ', showAppSupport);
	$: console.log($currentBoostDestinations);

	let appDestination = [
		{
			'@_address': '030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3',
			'@_customKey': '696969',
			'@_customValue': 'eChoVKtO1KujpAA5HCoB',
			'@_name': 'LN Beats',
			'@_split': '100',
			'@_type': 'node'
		}
	];

	async function handleBoost() {
		try {
			throwConfetti();
			console.log(showAppSupport ? appDestination : $currentBoostDestinations);
			sendBoost({
				webln: $webln,
				destinations: showAppSupport ? appDestination : $currentBoostDestinations,
				satAmount: satAmount,
				boostagram: boostagram,
				wallet: $user.preferences.wallet,
				lockedAlbum: clone($playingAlbum),
				lockedSong: clone($playingSong)
			});
			await saveBoostData();
			$currentBoostDestinations = null;
			$posterSwiper.enabled = true;
			boostagram = '';
			$showBoostScreen = false;
		} catch (err) {
			// Tell the user what went wrong
			alert(
				`${err.message} \r\n\r\nTry using \r\n  Alby ( https://getalby.com/ )\r\n    on the Desktop \r\nor\r\n  Kiwi Browser ( https://kiwibrowser.com/ )\r\n    on your mobile device. Then you can install Alby on Kiwi. \r\n \r\nYou can also install Blue Wallet ( https://bluewallet.io/ ) \r\n or Blixt Wallet ( https://blixtwallet.github.io/ )  \r\n on your mobile device.`
			);
		}
	}

	async function saveBoostData() {
		const boostDB = localforage.createInstance({
			name: 'boostDB'
		});
		$satsPerBoost = satAmount;
		boostDB.setItem('senderName', $senderName);
		boostDB.setItem('satsPerBoost', $satsPerBoost);
		boostDB.setItem('satsPerSong', $satsPerSong);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<blurred-background
	on:mousedown|self={() => {
		$showBoostScreen = false;
		$posterSwiper.enabled = true;
		boostagram = '';
	}}
>
	<button
		class="close"
		on:click={() => {
			$showBoostScreen = false;
			$posterSwiper.enabled = true;
			boostagram = '';
		}}
	>
		<Close size={30} style={'color: var(--color-text-boost-cancel-0);'} />
	</button>
	<card>
		{#if showAppSupport}
			<h2>Thanks for Supporting<br />LN Beats</h2>
		{/if}
		<boostagram>
			<label>
				<p>Sender Name</p>
				<input type="text" name="sender-name" placeholder="sender name" bind:value={$senderName} />
			</label>
			<label>
				<p>Boost Amount</p>
				<input
					type="number"
					name="boost-amount"
					placeholder="boost amount"
					bind:value={satAmount}
				/>
			</label>
			<label class="boostagram">
				<p>Boostagram</p>
				<textarea placeholder="message" bind:value={boostagram} />
			</label>
			<boost-actions>
				{#if !showAppSupport}
					<button
						on:click={() => {
							showAppSupport = true;
						}}
						class="support-button"
					>
						<span>Support</span> <span>LNBeats</span>
					</button>
				{:else}
					<support-placeholder />
				{/if}
				<button class="send" on:click={handleBoost}> <RocketLaunch size={35} /></button>
			</boost-actions>
		</boostagram>
		{#if !showAppSupport}
			<sats-per-song>
				<label>
					<p>Send this many sats after a song ends.</p>
					<input
						type="number"
						name="sats-per-song"
						placeholder="send sats per song"
						bind:value={$satsPerSong}
					/>
				</label>
				<button
					class="save"
					on:click={async () => {
						await saveBoostData();
						$showBoostScreen = false;
					}}>Save</button
				>
			</sats-per-song>
		{:else}
			<p class="support">Send us your praise, complaints, and suggestions.</p>
		{/if}
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
		z-index: 100;
		backdrop-filter: blur(5px) contrast(60%);
		-webkit-backdrop-filter: blur(2px) contrast(60%);
	}

	card {
		height: calc(100% - 48px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
		width: calc(100% - 36px - env(safe-area-inset-right) - env(safe-area-inset-left));
		max-width: 380px;
		max-height: 660px;
		border-radius: 8px;
		padding: 8px;
		margin-top: calc(env(safe-area-inset-top));
		background-color: var(--color-bg-boostagram-1);
		color: var(--color-text-0);
		display: flex;
		flex-direction: column;
	}

	boost-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	h2 {
		text-align: center;
		margin: 0 0 8px 0;
		font-size: 1.8em;
	}

	.support {
		margin-bottom: 16px;
		text-align: center;
		font-size: 0.85em;
		font-style: italic;
	}

	boostagram {
		flex-grow: 1;
	}

	sats-per-song {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	sats-per-song label {
		text-align: right;
	}

	sats-per-song input {
		text-align: right;
		width: 50%;
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

	button.save {
		background-color: var(--color-bg-boost-button);
		background-color: var(--color-progressbar-0);
		color: var(--color-text-boost-button);
		width: 50px;
		height: 50px;
		border-radius: 50px;
		font-weight: 600;
	}

	button.send {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		padding: 0;
		margin: 8px 0 0 0;
		background-color: var(--color-bg-boost-button);
		color: var(--color-text-boost-button);
		width: 60px;
		height: 60px;
		border-radius: 50px;
	}

	button.support-button {
		margin: 0;
		padding: 8px;
		width: 60px;
		height: 60px;
		border-radius: 50px;
		font-weight: 550;
		background-color: var(--color-bg-support-button);
		color: var(--color-text-support-button);
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.support-button span {
		font-size: 0.8em;
		color: var(--color-text-0);
	}

	.support-button span:first-of-type {
		margin-top: 1.5px;
	}

	input {
		background-color: var(--color-input-bg-0);
		padding: 4px;
		margin-left: 4px;
		width: calc(100% - 16px);
	}

	textarea {
		resize: none;
		height: 247px;
		width: calc(100% - 16px);
		margin-left: 4px;
		background-color: var(--color-input-bg-0);
		font-size: 1.3em;
	}

	p {
		font-weight: 600;
		margin: 0;
		padding: 0;
		font-size: 0.8em;
		font-style: normal;
	}

	label {
		display: block;
		min-height: 50px;
	}
</style>
