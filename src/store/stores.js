import { writable } from 'svelte/store';

export const indexSearchResults = writable([]);
export const library = writable({});
export const selectedAlbum = writable({});
export const playingAlbum = writable({});
export const selectedSong = writable({});
export const playingSong = writable({});
export const player = writable();
export const playerTime = writable(0);
export const playerDuration = writable(0);
export const playerSaveTime = writable(0);
export const posterSwiper = writable();
export const satsPerSong = writable(0);
