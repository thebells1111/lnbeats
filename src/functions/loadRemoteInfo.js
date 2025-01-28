import { remoteServer } from '$/stores';

export default async function loadRemoteInfo(remoteSong) {
	if (!remoteSong['@_feedGuid']) {
		return;
	}

	let remoteInfo = await fetchRemoteItem(remoteSong['@_feedGuid'], remoteSong['@_itemGuid']);

	if (!remoteInfo.episode || remoteInfo.episode.length === 0) {
		let feedInfo = await fetchRemoteFeed(remoteSong['@_feedGuid']);

		console.log(feedInfo.feed);

		remoteInfo = {
			episode: {
				title: 'Unknown',
				feedTitle: feedInfo.feed.title,
				image: feedInfo.feed.image,
				podcastGuid: feedInfo.feed.podcastGuid
			}
		};
	}

	return remoteInfo.episode || {};
}

async function fetchRemoteItem(feedGuid, itemGuid) {
	const itemsUrl =
		remoteServer +
		`api/queryindex?q=${encodeURIComponent(
			`episodes/byguid?podcastguid=${feedGuid}&guid=${itemGuid}`
		)}`;
	const res = await fetch(itemsUrl);
	return await res.json();
}

async function fetchRemoteFeed(feedGuid) {
	const itemsUrl =
		remoteServer + `api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${feedGuid}`)}`;
	const res = await fetch(itemsUrl);
	return await res.json();
}
