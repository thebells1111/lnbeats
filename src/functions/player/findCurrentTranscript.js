import { get } from 'svelte/store';
import { playingTranscript, currentTranscriptIndex } from '$/stores';

function findCurrentTranscript(currentTime) {
	let $playingTranscript = get(playingTranscript);
	let $currentTranscriptIndex = get(currentTranscriptIndex);

	if ($playingTranscript?.length) {
		if (currentTime < $playingTranscript[0]) {
			currentTranscriptIndex.set(undefined);
		} else {
			currentTranscriptIndex.set($currentTranscriptIndex || 0);
		}

		while (currentTime >= ($playingTranscript?.[$currentTranscriptIndex + 1]?.from / 1000)) {
			$currentTranscriptIndex++;
		}

		while (currentTime < ($playingTranscript?.[$currentTranscriptIndex]?.from / 1000)) {
			$currentTranscriptIndex--;
		}

		currentTranscriptIndex.set($currentTranscriptIndex);
	}
}

export default findCurrentTranscript;
