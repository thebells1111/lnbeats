import { playingSong, player } from '$/stores';
import { get } from 'svelte/store';

export default function loadSong(song) {
	let _player = get(player);
	_player.pause();
	playingSong.set(song);
	_player.src = get(playingSong).enclosureUrl;
	setTimeout(() => _player.play(), 200);
}
