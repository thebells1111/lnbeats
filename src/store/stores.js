import { writable } from 'svelte/store';
import { dev } from '$app/environment';
import localforage from 'localforage';

export const remoteServer = dev ? 'http://localhost:8000/' : 'https://api.lnbeats.com/';
export const albyClientId = dev ? '32dVOIuGiA' : '9QX2jPuEiu';

export const playlistsDB = localforage.createInstance({
	name: 'playlistsDB'
});

export const indexSearchResults = writable([]);
export const albumSearch = writable('');
export const library = writable({});
export const albumMap = writable(new Map());
export const discoverList = writable([]);
export const masterSongList = writable([]);
export const featuredList = writable([]);
export const discoverScreen = writable('featured');
export const publishingDisplay = writable('');
export const playlists = writable({});
export const updatePlaylistIndex = writable(-1);
export const favorites = writable({});
export const selectedPlaylist = writable([]);
export const selectedAlbum = writable({});
export const playingAlbum = writable({});
export const playingSongList = writable([]);
export const shuffleSongs = writable(false);
export const loopSongs = writable(false);
export const playingSong = writable({});
export const playingIndex = writable();
export const player = writable();
export const playerTime = writable(0);
export const playerDuration = writable(0);
export const playerSaveTime = writable(0);
export const mediaSession = writable();

export const satsPerSong = writable(0);
export const satsPerBoost = writable(1000);
export const senderName = writable('');
export const user = writable({
	name: '',
	balance: 0,
	loggedIn: false,
	preferences: { wallet: 'albyApi' }
});

export const artistList = writable({});
export const selectedArtist = writable([]);

export const valueTimeSplitBlock = writable([]);
export const displayChapters = writable([]);
export const playingChapters = writable([]);
export const currentPlayingChapter = writable();
export const currentChapterIndex = writable(0);
export const chapterBoostBypass = writable(false);
export const playingTranscript = writable([]);
export const playingTranscriptText = writable('');
export const currentTranscriptIndex = writable(0);
export const currentTranscript = writable([]);
export const currentSplitDestinations = writable();
export const currentSplit = writable({});
export const webln = writable();

export const showBoostScreen = writable(false);
export const currentBoostDestinations = writable();
export const showInstructionScreen = writable(false);

export const top100 = writable([]);
export const sortedTop100 = writable([]);

export const radio = writable([]);
export const lnbRadio = writable([]);
export const lnbRadioAlbums = writable({});
export const lnbRadioPlaying = writable(false);
export const shareInfo = writable({});

export const remotePlaylist = writable([]);
export const remotePlaylistPlaying = writable(false);
export const isPlaylist = writable(false);
export const playlistControls = writable({});

export const activeScreen = writable('discover');

export const posterSwiper = writable();
export const albumSwiper = writable();
export const playlistControlsSwiper = writable();
export const createPlaylistSwiper = writable();
export const walletSwiper = writable();
export const boostSwiper = writable();
export const shareSwiper = writable();
export const artistSwiper = writable();

export const albumContextMenu = writable({
	visible: false,
	x: 0,
	y: 0,
	link: '',
	id: null // Unique identifier for the clicked item
});
