import { writable } from 'svelte/store';
import { dev } from '$app/environment';
import localforage from 'localforage';

export const remoteServer = dev ? 'http://localhost:8000/' : 'https://curiohoster.com/';

export const libraryDB = localforage.createInstance({
	name: 'libraryDB'
});

export const indexSearchResults = writable([]);
export const library = writable({});
export const discoverList = writable([]);
export const playlists = writable(new Set());
export const selectedPlaylist = writable([]);
export const selectedAlbum = writable({});
export const playingAlbum = writable({});
export const selectedSong = writable({});
export const playingSong = writable({});
export const playingIndex = writable();
export const player = writable();
export const playerTime = writable(0);
export const playerDuration = writable(0);
export const playerSaveTime = writable(0);
export const posterSwiper = writable();
export const satsPerSong = writable(0);
export const satsPerBoost = writable(1000);
export const senderName = writable('');
export const user = writable({
	name: '',
	balance: 0,
	loggedIn: false,
	preferences: { wallet: 'albyApi' }
});

export const timeValueSplitBlock = writable([]);
export const currentSplitDestinations = writable();
export const webln = writable();

export const showBoostScreen = writable(false);
export const showInstructionScreen = writable(false);
