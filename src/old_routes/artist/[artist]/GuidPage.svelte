<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { parse } from 'fast-xml-parser';
	import { decode } from 'html-entities';
	let feed;

	onMount(() => {
		fetchFeed();
	});

	async function fetchFeed() {
		parseFeed('/sample.rss');
	}

	async function parseFeed(url) {
		const parserOptions = {
			attributeNamePrefix: '@_',
			//attrNodeName: false,
			//textNodeName : "#text",
			ignoreAttributes: false,
			ignoreNameSpace: false,
			attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
			tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
		};
		const res = await fetch(url);
		let data = await res.text();
		let xml2Json = parse(data, parserOptions);
		console.log(xml2Json);
		feed = xml2Json?.rss?.channel;
		console.log(feed);
	}
</script>

{#if feed}
	<img src={feed['itunes:image']['@_href']} alt={feed.title} />
{/if}

<style>
	ul {
		display: flex;
		padding: 0;
		margin: 8px 0 0 8px;
		flex: 1;
		width: calc(100% - 8px);
		flex-wrap: wrap;
		justify-content: center;
		overflow: auto;
	}

	li {
		list-style: none;
	}
</style>
