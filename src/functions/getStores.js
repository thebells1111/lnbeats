import { get } from 'svelte/store';

function getStores(stores) {
	const $stores = {};
	for (const [key, store] of Object.entries(stores)) {
		$stores[`$${key}`] = get(store);
	}
	return $stores;
}

export default getStores;
