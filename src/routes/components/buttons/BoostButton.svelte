<script>
	import { requestProvider } from 'webln';
	import confetti from 'canvas-confetti';
	import { playingAlbum, playingSong, player } from '$/stores';

	let senderName = 'StevenB';
	let boostagram = 'MSP Test Boost';
	let satAmount = 100;
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
			sender_name: senderName
		};
	};

	async function showBoost() {
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
						await webln.keysend({
							destination: dest.address,
							amount: amount,
							customRecords: customRecords
						});
					} catch (err) {
						alert(`error with  ${dest.name}:  ${err.message}`);
					}
				}
			}

			for (const dest of splitsDestinations) {
				let record = getBaseRecord();
				let amount = Math.round((dest.split / 100) * runningTotal);
				record.name = dest.name;
				record.value_msat = amount * 1000;
				if (amount >= 1) {
					let customRecords = { '7629169': JSON.stringify(record) };
					if (dest.customKey) {
						customRecords[dest.customKey] = dest.customValue;
					}

					try {
						await webln.keysend({
							destination: dest.address,
							amount: amount,
							customRecords: customRecords
						});
					} catch (err) {
						alert(`error with  ${dest.name}:  ${err.message}`);
					}
				}
			}
		}
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
</script>

{#if window?.webln}
	<button on:click={showBoost}>Boost</button>
{:else}
	Alby
{/if}
