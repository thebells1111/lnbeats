<script>
	import localforage from 'localforage';
	import throwConfetti from '$functions/throwConfetti';
	import sendBoost from '$functions/sendBoost';
	import clone from 'just-clone';
	import InfoModal from '$c/Modals/InfoModal.svelte';

	import {
		boostSwiper,
		satsPerSong,
		senderName,
		satsPerBoost,
		user,
		webln,
		currentBoostDestinations,
		playingAlbum,
		playingSong
	} from '$/stores';
	import RocketLaunch from '$icons/RocketLaunch.svelte';

	let showAppSupport = false;

	let boostagram = '';
	let satAmount = $satsPerBoost;
	let showSaved = false;

	$: console.log('appSupport: ', showAppSupport);
	$: console.log($currentBoostDestinations);

	let appDestination = [
		{
			'@_address': '035ad2c954e264004986da2d9499e1732e5175e1dcef2453c921c6cdcc3536e9d8',
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
			boostagram = '';
			document.getElementById('boost-swiper').style.visibility = 'hidden';
			$boostSwiper.slideTo(0);
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
		showSaved = true;
		setTimeout(() => {
			showSaved = false;
		}, 500);
	}
</script>

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
			<input type="number" name="boost-amount" placeholder="boost amount" bind:value={satAmount} />
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
				}}>Save</button
			>
		</sats-per-song>
	{:else}
		<p class="support">Send us your praise, complaints, and suggestions.</p>
	{/if}
</card>

{#if showSaved}
	<InfoModal>
		<h2 class="saved">Saved</h2>
	</InfoModal>
{/if}

<style>
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

	.saved {
		padding: 16px 32px;
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
