<script>
	import { requestProvider } from 'webln';
	import localforage from 'localforage';
	import confetti from 'canvas-confetti';
	import {
		playingAlbum,
		playingSong,
		player,
		posterSwiper,
		satsPerSong,
		senderName,
		satsPerBoost
	} from '$/stores';
	export let showBoostScreen;
	import Close from '$icons/CancelFilled.svelte';
	import RocketLaunch from '$icons/RocketLaunch.svelte';

	let boostagram = '';
	let satAmount = $satsPerBoost;
	$: destinations = $playingSong?.value?.destinations || $playingAlbum?.value?.destinations;

	const getBaseRecord = () => {
		return {
			podcast: $playingAlbum?.title,
			feedID: $playingAlbum?.id,
			itemID: $playingSong?.id,
			episode: $playingSong?.title,
			ts: Math.trunc($player.currentTime),
			action: 'boost',
			app_name: 'Podcast Index',
			value_msat: 0,
			value_msat_total: satAmount * 1000,
			name: undefined,
			message: boostagram,
			sender_name: $senderName
		};
	};

	async function sendBoost() {
		try {
			webln = await requestProvider();
		} catch (err) {
			// Tell the user what went wrong
			alert(
				`${err.message} \r\n Try using Alby ( https://getalby.com/ ) on the Desktop \r\n or installing Blue Wallet ( https://bluewallet.io/ ) \r\n or Blixt Wallet ( https://blixtwallet.github.io/ )  \r\n on your mobile device.`
			);
		}

		let feesDestinations = destinations.filter((v) => v.fee);
		let splitsDestinations = destinations.filter((v) => !v.fee);
		let runningTotal = satAmount;

		if (webln) {
			throwConfetti();
			for (const dest of feesDestinations) {
				let feeRecord = getBaseRecord();

				let amount = Math.round((dest.split / 100) * satAmount);
				if (amount) {
					runningTotal -= amount;
					feeRecord.name = dest.name;
					feeRecord.value_msat = amount * 1000;

					let customRecords = { '7629169': JSON.stringify(feeRecord) };

					if (dest.customKey) {
						customRecords[dest.customKey] = dest.customValue;
					}

					try {
						let record = {
							destination: dest.address,
							amount: amount,
							customRecords: customRecords
						};
						console.log(record);
						// await webln.keysend(record);
					} catch (err) {
						alert(`error with  ${dest.name}:  ${err.message}`);
					}
				}
			}

			for (const dest of splitsDestinations) {
				let record = getBaseRecord();
				let amount = Math.round((dest.split || 100 / 100) * runningTotal);
				record.name = dest.name;
				record.value_msat = amount * 1000;
				if (amount >= 1) {
					let customRecords = { '7629169': JSON.stringify(record) };
					if (dest.customKey) {
						customRecords[dest.customKey] = dest.customValue;
					}

					try {
						let record = {
							destination: dest.address,
							amount: amount,
							customRecords: customRecords
						};
						console.log(record);
						// await webln.keysend(record);
					} catch (err) {
						alert(`error with  ${dest.name}:  ${err.message}`);
					}
				}
			}
		}
		await saveBoostData();
		showBoostScreen = false;
	}

	function throwConfetti() {
		let end = Date.now() + 0.1 * 1000;

		let colors = ['#fa6060', '#faa560', '#faf760', '#b2fa60', '#60c1fa', '#7260fa', '#fa60f2'];

		(function frame() {
			confetti({
				particleCount: 12,
				angle: 60,
				spread: 75,
				origin: { x: 0, y: 0.9 },
				colors: colors
			});
			confetti({
				particleCount: 12,
				angle: 120,
				spread: 75,
				origin: { x: 1, y: 0.9 },
				colors: colors
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		})();
	}

	async function saveBoostData() {
		const boostDB = localforage.createInstance({
			name: 'boostDB'
		});
		boostDB.setItem('senderName', $senderName);
		boostDB.setItem('satsPerBoost', satAmount);
	}
</script>

<blurred-background on:click|self={() => (showBoostScreen = false)}>
	<button
		class="close"
		on:click={() => {
			showBoostScreen = false;
			$posterSwiper.enabled = true;
		}}
	>
		<Close size={30} style={'color: var(--color-text-boost-cancel-0);'} />
	</button>
	<card>
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
				<button class="send" on:click={sendBoost}> <RocketLaunch size={35} /></button>
			</boost-actions>
		</boostagram>
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
					showBoostScreen = false;
				}}>Save</button
			>
		</sats-per-song>
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

	boost-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
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
		top: 2px;
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
