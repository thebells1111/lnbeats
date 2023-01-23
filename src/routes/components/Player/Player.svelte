<script>
	import gotoNextSong from '$functions/gotoNextSong';
	import { player, playingSong, playingAlbum } from '$/stores';
	import PlayPauseButton from '$buttons/player/PlayPauseButton.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	function setupPlayer() {
		$player.ontimeupdate = () => {
			$player.currentTime = $player.currentTime;
		};
		$player.onloadedmetadata = () => {
			$player.duration = $player.duration;
		};
		$player.onended = () => {
			gotoNextSong();
		};
	}

	onMount(setupPlayer);
</script>

<audio playsinline preload="metadata" bind:this={$player} />

<playbar class:hide={!$playingSong.enclosureUrl || [`/poster`].find((r) => r === $page.route.id)}>
	<a href="/poster">
		<img
			src={$playingSong.image ||
				$playingSong.artwork ||
				$playingAlbum.image ||
				$playingAlbum.artwork}
		/>
	</a>
	<p>{$playingSong.title}</p>
	<PlayPauseButton song={$playingSong} />
</playbar>

<style>
	playbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 4px;
		background-color: pink;
	}

	.hide {
		display: none;
	}

	a {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	p {
		width: 100%;
		padding: 0 8px;
	}

	img {
		width: 50px;
	}
</style>
