import { get } from 'svelte/store';
import { valueTimeSplitBlock } from '$/stores';

function findCurrentSplit(currentTime) {
	let $valueTimeSplitBlock = get(valueTimeSplitBlock);

	let activeItem = null;

	$valueTimeSplitBlock.forEach((item) => {
		let startTime = parseFloat(item.startTime);
		let duration = parseFloat(item.duration);

		if (startTime <= currentTime && startTime + duration > currentTime) {
			if (activeItem == null || startTime > parseFloat(activeItem.startTime)) {
				activeItem = item;
			}
		}
	});

	return activeItem;
}

export default findCurrentSplit;
