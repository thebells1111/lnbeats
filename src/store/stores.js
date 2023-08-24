import { writable } from 'svelte/store';
import { dev } from '$app/environment';

export const remoteServer = dev ? 'http://localhost:8000/' : 'https://api.lnbeats.com/';
export const albyClientId = dev ? '32dVOIuGiA' : '9QX2jPuEiu';

export const indexSearchResults = writable([]);
export const albumSearch = writable('');
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

export const valueTimeSplitBlock = writable([]);
export const displayChapters = writable([]);
export const playingChapters = writable([]);
export const currentPlayingChapter = writable();
export const currentChapterIndex = writable(0);
export const chapterBoostBypass = writable(false);
export const currentSplitDestinations = writable();
export const webln = writable();

export const showBoostScreen = writable(false);
export const currentBoostDestinations = writable();
export const showInstructionScreen = writable(false);
