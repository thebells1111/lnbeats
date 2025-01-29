import getStores from '$functions/getStores';
import { playingChapters, currentChapterIndex, currentPlayingChapter } from '$/stores';

function findCurrentChapter(currentTime) {
	let { $playingChapters, $currentChapterIndex, $currentPlayingChapter } = getStores({
		playingChapters,
		currentChapterIndex,
		currentPlayingChapter
	});

	if ($playingChapters?.length) {
		while (currentTime >= $playingChapters?.[$currentChapterIndex + 1]?.startTime) {
			$currentChapterIndex++;
		}

		while (currentTime < $playingChapters?.[$currentChapterIndex]?.startTime) {
			$currentChapterIndex--;
		}
		currentChapterIndex.set($currentChapterIndex);

		// if ($playingChapters?.[$currentChapterIndex]?.endTime) {
		// 	if ($player.currentTime > $playingChapters[$currentChapterIndex].endTime) {
		// 		$useDefaultChapter = true;
		// 	} else {
		// 		$useDefaultChapter = false;
		// 	}
		// } else {
		// 	$useDefaultChapter = false;
		// }

		let foundChapter = $playingChapters[$currentChapterIndex];

		if (JSON.stringify($currentPlayingChapter) !== JSON.stringify(foundChapter)) {
			currentPlayingChapter.set(foundChapter);
		}
	}
}

export default findCurrentChapter;
